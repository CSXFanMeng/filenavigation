use std::{
    collections::HashMap,
    collections::VecDeque,
    fs,
    path::{Path, PathBuf},
    process::Command,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::{Duration, Instant, SystemTime},
};

use chrono::{DateTime, Local};
use semver::Version;
use serde::{Deserialize, Serialize};
use tauri::Emitter;

const LATEST_RELEASE_URL: &str =
    "https://api.github.com/repos/CSXFanMeng/filenavigation/releases/latest";
const UPDATER_MANIFEST_URL: &str =
    "https://github.com/CSXFanMeng/filenavigation/releases/latest/download/latest.json";
const RELEASE_TAG_URL: &str = "https://github.com/CSXFanMeng/filenavigation/releases/tag";
const RELEASE_USER_AGENT: &str = "FileNavigation update checker";
const RELEASE_CACHE_TTL: Duration = Duration::from_secs(15 * 60);

#[derive(Debug, Deserialize)]
struct SearchRequest {
    search_id: String,
    root: String,
    query: String,
    case_sensitive: bool,
    include_hidden: bool,
    max_results: usize,
}

#[derive(Debug, Serialize)]
struct SearchResponse {
    search_id: String,
    results: Vec<SearchResult>,
    stats: SearchStats,
    truncated: bool,
    cancelled: bool,
}

#[derive(Debug, Serialize)]
struct SearchStats {
    files_scanned: u64,
    directories_scanned: u64,
    skipped_entries: u64,
    elapsed_ms: u128,
}

#[derive(Debug, Serialize)]
struct SearchResult {
    name: String,
    path: String,
    kind: String,
    is_dir: bool,
    size: u64,
    modified: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
struct SearchProgress {
    search_id: String,
    files_scanned: u64,
    directories_scanned: u64,
    skipped_entries: u64,
    matches: usize,
    current_path: String,
    elapsed_ms: u128,
}

#[derive(Default)]
struct SearchSessions {
    cancel_tokens: Mutex<HashMap<String, Arc<AtomicBool>>>,
}

struct UpdateChecker {
    client: reqwest::Client,
    cached_release: Mutex<Option<CachedRelease>>,
}

impl Default for UpdateChecker {
    fn default() -> Self {
        let client = reqwest::Client::builder()
            .user_agent(RELEASE_USER_AGENT)
            .connect_timeout(Duration::from_secs(4))
            .timeout(Duration::from_secs(10))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        Self {
            client,
            cached_release: Mutex::new(None),
        }
    }
}

struct CachedRelease {
    fetched_at: Instant,
    release: ReleaseInfo,
}

#[derive(Clone)]
struct ReleaseInfo {
    latest_version: String,
    release_name: String,
    raw_notes: String,
    release_url: String,
    published_at: Option<String>,
    assets: Vec<UpdateAsset>,
}

#[derive(Debug, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    name: Option<String>,
    body: Option<String>,
    html_url: String,
    published_at: Option<String>,
    assets: Vec<GitHubAsset>,
}

#[derive(Debug, Deserialize)]
struct GitHubAsset {
    name: String,
    size: u64,
    browser_download_url: String,
    digest: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UpdaterManifest {
    version: String,
    #[serde(default)]
    notes: String,
    pub_date: Option<String>,
    #[serde(default)]
    platforms: HashMap<String, UpdaterPlatform>,
}

#[derive(Debug, Deserialize)]
struct UpdaterPlatform {
    url: String,
    signature: String,
}

#[derive(Debug, Serialize, Clone)]
struct UpdateResponse {
    current_version: String,
    latest_version: String,
    has_update: bool,
    release_name: String,
    release_notes: String,
    release_language: String,
    release_url: String,
    published_at: Option<String>,
    assets: Vec<UpdateAsset>,
}

#[derive(Debug, Serialize, Clone)]
struct UpdateAsset {
    name: String,
    size: u64,
    download_url: String,
    digest: Option<String>,
}

#[tauri::command]
async fn search_files(
    app: tauri::AppHandle,
    state: tauri::State<'_, SearchSessions>,
    request: SearchRequest,
) -> Result<SearchResponse, String> {
    let search_id = request.search_id.clone();
    let cancel_token = Arc::new(AtomicBool::new(false));
    state
        .cancel_tokens
        .lock()
        .map_err(|_| "searchTaskFailed".to_string())?
        .insert(search_id.clone(), cancel_token.clone());

    let result = tokio::task::spawn_blocking(move || perform_search(app, request, cancel_token))
        .await
        .map_err(|_| "searchTaskFailed".to_string())?;

    state
        .cancel_tokens
        .lock()
        .map_err(|_| "searchTaskFailed".to_string())?
        .remove(&search_id);

    result
}

#[tauri::command]
fn cancel_search(state: tauri::State<'_, SearchSessions>, search_id: String) -> Result<(), String> {
    if let Some(cancel_token) = state
        .cancel_tokens
        .lock()
        .map_err(|_| "searchTaskFailed".to_string())?
        .get(&search_id)
    {
        cancel_token.store(true, Ordering::Relaxed);
    }

    Ok(())
}

#[tauri::command]
async fn open_path(path: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || open_path_native(&path))
        .await
        .map_err(|_| "openTaskFailed".to_string())?
}

#[tauri::command]
async fn check_for_updates(
    state: tauri::State<'_, UpdateChecker>,
    language: String,
) -> Result<UpdateResponse, String> {
    if let Some(release) = cached_release(&state, Some(RELEASE_CACHE_TTL))? {
        return build_update_response(&release, &language);
    }

    let stale_release = cached_release(&state, None)?;
    match fetch_release_info(&state.client).await {
        Ok(release) => {
            let response = build_update_response(&release, &language)?;
            *state
                .cached_release
                .lock()
                .map_err(|_| "updateCheckFailed".to_string())? = Some(CachedRelease {
                fetched_at: Instant::now(),
                release,
            });
            Ok(response)
        }
        Err(error) => stale_release
            .as_ref()
            .map(|release| build_update_response(release, &language))
            .transpose()?
            .ok_or(error),
    }
}

fn cached_release(
    state: &UpdateChecker,
    max_age: Option<Duration>,
) -> Result<Option<ReleaseInfo>, String> {
    let cache = state
        .cached_release
        .lock()
        .map_err(|_| "updateCheckFailed".to_string())?;

    Ok(cache.as_ref().and_then(|cached| {
        let fresh_enough = max_age.is_none_or(|age| cached.fetched_at.elapsed() <= age);
        fresh_enough.then(|| cached.release.clone())
    }))
}

async fn fetch_release_info(client: &reqwest::Client) -> Result<ReleaseInfo, String> {
    let manifest_error = match fetch_updater_manifest(client).await {
        Ok(manifest) => return Ok(release_info_from_manifest(manifest)),
        Err(error) => error,
    };

    fetch_github_release(client).await.map_err(|api_error| {
        if manifest_error == "updateNetworkFailed" {
            manifest_error
        } else {
            api_error
        }
    })
}

async fn fetch_updater_manifest(client: &reqwest::Client) -> Result<UpdaterManifest, String> {
    let mut last_error = "updateCheckFailed".to_string();
    for attempt in 0..2 {
        match fetch_updater_manifest_once(client).await {
            Ok(manifest) => return Ok(manifest),
            Err(error) => last_error = error,
        }

        if attempt == 0 {
            tokio::time::sleep(Duration::from_millis(300)).await;
        }
    }

    Err(last_error)
}

async fn fetch_updater_manifest_once(client: &reqwest::Client) -> Result<UpdaterManifest, String> {
    let response = client
        .get(UPDATER_MANIFEST_URL)
        .send()
        .await
        .map_err(|_| "updateNetworkFailed".to_string())?;

    if response.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("updateNotFound".to_string());
    }

    response
        .error_for_status()
        .map_err(|_| "updateCheckFailed".to_string())?
        .json::<UpdaterManifest>()
        .await
        .map_err(|_| "updateCheckFailed".to_string())
}

async fn fetch_github_release(client: &reqwest::Client) -> Result<ReleaseInfo, String> {
    let response = client
        .get(LATEST_RELEASE_URL)
        .send()
        .await
        .map_err(|_| "updateNetworkFailed".to_string())?;

    if matches!(
        response.status(),
        reqwest::StatusCode::FORBIDDEN | reqwest::StatusCode::TOO_MANY_REQUESTS
    ) {
        return Err("updateRateLimited".to_string());
    }

    if response.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("updateNotFound".to_string());
    }

    let release = response
        .error_for_status()
        .map_err(|_| "updateCheckFailed".to_string())?
        .json::<GitHubRelease>()
        .await
        .map_err(|_| "updateCheckFailed".to_string())?;

    Ok(ReleaseInfo {
        latest_version: release.tag_name.trim_start_matches('v').to_string(),
        release_name: release.name.unwrap_or_else(|| release.tag_name.clone()),
        raw_notes: release.body.unwrap_or_default(),
        release_url: release.html_url,
        published_at: release.published_at,
        assets: release
            .assets
            .into_iter()
            .map(|asset| UpdateAsset {
                name: asset.name,
                size: asset.size,
                download_url: asset.browser_download_url,
                digest: asset.digest,
            })
            .collect(),
    })
}

fn release_info_from_manifest(manifest: UpdaterManifest) -> ReleaseInfo {
    let latest_version = manifest.version.trim_start_matches('v').to_string();
    let mut assets_by_url = HashMap::new();
    for platform in manifest.platforms.into_values() {
        assets_by_url
            .entry(platform.url)
            .or_insert(platform.signature);
    }

    let mut assets = assets_by_url
        .into_iter()
        .map(|(download_url, signature)| UpdateAsset {
            name: download_url
                .rsplit('/')
                .next()
                .unwrap_or("update-package")
                .to_string(),
            size: 0,
            download_url,
            digest: (!signature.is_empty()).then(|| format!("minisign:{signature}")),
        })
        .collect::<Vec<_>>();
    assets.sort_by(|left, right| left.name.cmp(&right.name));

    ReleaseInfo {
        release_name: format!("FileNavigation v{latest_version}"),
        raw_notes: manifest.notes,
        release_url: format!("{RELEASE_TAG_URL}/v{latest_version}"),
        published_at: manifest.pub_date,
        latest_version,
        assets,
    }
}

fn build_update_response(release: &ReleaseInfo, language: &str) -> Result<UpdateResponse, String> {
    let current_version = env!("CARGO_PKG_VERSION").to_string();
    let current =
        Version::parse(&current_version).map_err(|_| "versionCompareFailed".to_string())?;
    let latest =
        Version::parse(&release.latest_version).map_err(|_| "versionCompareFailed".to_string())?;

    let (release_notes, release_language) = localized_release_notes(&release.raw_notes, language);

    Ok(UpdateResponse {
        current_version,
        latest_version: release.latest_version.clone(),
        has_update: latest > current,
        release_name: release.release_name.clone(),
        release_notes,
        release_language,
        release_url: release.release_url.clone(),
        published_at: release.published_at.clone(),
        assets: release.assets.clone(),
    })
}

fn localized_release_notes(body: &str, language: &str) -> (String, String) {
    let candidates = release_language_candidates(language);
    for candidate in candidates {
        if let Some(notes) = extract_lang_block(body, &candidate) {
            return (notes, candidate);
        }
    }

    if let Some(notes) = extract_lang_block(body, "en") {
        return (notes, "en".to_string());
    }

    (body.to_string(), "raw".to_string())
}

fn release_language_candidates(language: &str) -> Vec<String> {
    let mut candidates = vec![language.to_string()];
    if let Some(base) = language.split('-').next() {
        if base != language {
            candidates.push(base.to_string());
        }
    }

    match language {
        "zh" | "zh-CN" | "zh-Hans" => candidates.push("zh-CN".to_string()),
        "zh-TW" | "zh-Hant" => candidates.push("zh-TW".to_string()),
        "pt" | "pt-BR" | "pt-PT" => candidates.push("pt-BR".to_string()),
        _ => {}
    }

    candidates.dedup();
    candidates
}

fn extract_lang_block(body: &str, language: &str) -> Option<String> {
    let start_marker = format!("<!-- lang:{language} -->");
    let end_marker = "<!-- /lang -->";
    let start = body.find(&start_marker)? + start_marker.len();
    let rest = &body[start..];
    let end = rest.find(end_marker).unwrap_or(rest.len());
    let notes = rest[..end].trim();

    if notes.is_empty() {
        None
    } else {
        Some(notes.to_string())
    }
}

fn perform_search(
    app: tauri::AppHandle,
    request: SearchRequest,
    cancel_token: Arc<AtomicBool>,
) -> Result<SearchResponse, String> {
    let root = PathBuf::from(request.root.trim());
    if !root.is_dir() {
        return Err("invalidDirectory".to_string());
    }

    let max_results = request.max_results.clamp(10, 5_000);
    let search_id = request.search_id.clone();
    let started = Instant::now();
    let needle = normalize(&request.query, request.case_sensitive);
    let mut queue = VecDeque::from([root]);
    let mut results = Vec::new();
    let mut files_scanned = 0;
    let mut directories_scanned = 0;
    let mut skipped_entries = 0;
    let mut truncated = false;
    let mut cancelled = false;
    let mut last_emit = Instant::now();

    while let Some(directory) = queue.pop_front() {
        if cancel_token.load(Ordering::Relaxed) {
            cancelled = true;
            break;
        }

        directories_scanned += 1;
        let entries = match fs::read_dir(&directory) {
            Ok(entries) => entries,
            Err(_) => {
                skipped_entries += 1;
                continue;
            }
        };

        for entry in entries.flatten() {
            if cancel_token.load(Ordering::Relaxed) {
                cancelled = true;
                break;
            }

            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();

            if !request.include_hidden && is_hidden(&path, &file_name) {
                continue;
            }

            let metadata = match entry.metadata() {
                Ok(metadata) => metadata,
                Err(_) => {
                    skipped_entries += 1;
                    continue;
                }
            };

            let is_dir = metadata.is_dir();
            if is_dir {
                queue.push_back(path.clone());
            } else {
                files_scanned += 1;
            }

            let haystack = normalize(&file_name, request.case_sensitive);
            if haystack.contains(&needle) {
                results.push(to_result(path.clone(), file_name, metadata, is_dir));
                if results.len() >= max_results {
                    truncated = true;
                    break;
                }
            }

            if last_emit.elapsed().as_millis() >= 120 {
                emit_progress(
                    &app,
                    SearchProgress {
                        search_id: search_id.clone(),
                        files_scanned,
                        directories_scanned,
                        skipped_entries,
                        matches: results.len(),
                        current_path: path.to_string_lossy().to_string(),
                        elapsed_ms: started.elapsed().as_millis(),
                    },
                );
                last_emit = Instant::now();
            }
        }

        if truncated || cancelled {
            break;
        }
    }

    emit_progress(
        &app,
        SearchProgress {
            search_id: search_id.clone(),
            files_scanned,
            directories_scanned,
            skipped_entries,
            matches: results.len(),
            current_path: String::new(),
            elapsed_ms: started.elapsed().as_millis(),
        },
    );

    Ok(SearchResponse {
        search_id,
        results,
        stats: SearchStats {
            files_scanned,
            directories_scanned,
            skipped_entries,
            elapsed_ms: started.elapsed().as_millis(),
        },
        truncated,
        cancelled,
    })
}

fn emit_progress(app: &tauri::AppHandle, progress: SearchProgress) {
    let _ = app.emit("search-progress", progress);
}

fn normalize(value: &str, case_sensitive: bool) -> String {
    if case_sensitive {
        value.to_string()
    } else {
        value.to_lowercase()
    }
}

fn to_result(path: PathBuf, name: String, metadata: fs::Metadata, is_dir: bool) -> SearchResult {
    SearchResult {
        name,
        path: path.to_string_lossy().to_string(),
        kind: if is_dir { "directory" } else { "file" }.to_string(),
        is_dir,
        size: if is_dir { 0 } else { metadata.len() },
        modified: metadata.modified().ok().map(format_system_time),
    }
}

fn format_system_time(time: SystemTime) -> String {
    let datetime: DateTime<Local> = DateTime::from(time);
    datetime.format("%Y-%m-%d %H:%M:%S").to_string()
}

#[cfg(target_family = "unix")]
fn is_hidden(_path: &Path, file_name: &str) -> bool {
    file_name.starts_with('.')
}

#[cfg(target_os = "windows")]
fn is_hidden(path: &Path, file_name: &str) -> bool {
    use std::os::windows::fs::MetadataExt;

    const FILE_ATTRIBUTE_HIDDEN: u32 = 0x2;
    if file_name.starts_with('.') {
        return true;
    }

    fs::metadata(path)
        .map(|metadata| metadata.file_attributes() & FILE_ATTRIBUTE_HIDDEN != 0)
        .unwrap_or(false)
}

#[cfg(target_os = "windows")]
fn open_path_native(path: &str) -> Result<(), String> {
    Command::new("explorer")
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|_| "openPathFailed".to_string())
}

#[cfg(target_os = "macos")]
fn open_path_native(path: &str) -> Result<(), String> {
    Command::new("open")
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|_| "openPathFailed".to_string())
}

#[cfg(all(target_family = "unix", not(target_os = "macos")))]
fn open_path_native(path: &str) -> Result<(), String> {
    Command::new("xdg-open")
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|_| "openPathFailed".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SearchSessions::default())
        .manage(UpdateChecker::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            search_files,
            cancel_search,
            open_path,
            check_for_updates
        ])
        .run(tauri::generate_context!())
        .expect("error while running FileNavigation");
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::{
        UpdaterManifest, UpdaterPlatform, build_update_response, localized_release_notes,
        release_info_from_manifest,
    };

    #[test]
    fn extracts_requested_release_language() {
        let body = r#"
<!-- lang:en -->
English notes.
<!-- /lang -->

<!-- lang:zh-CN -->
中文日志。
<!-- /lang -->
"#;

        let (notes, language) = localized_release_notes(body, "zh-CN");

        assert_eq!(language, "zh-CN");
        assert_eq!(notes, "中文日志。");
    }

    #[test]
    fn falls_back_to_english_release_language() {
        let body = r#"
<!-- lang:en -->
English notes.
<!-- /lang -->
"#;

        let (notes, language) = localized_release_notes(body, "ja");

        assert_eq!(language, "en");
        assert_eq!(notes, "English notes.");
    }

    #[test]
    fn updater_manifest_builds_localized_cached_release() {
        let notes = r#"
<!-- lang:en -->
English notes.
<!-- /lang -->
<!-- lang:zh-CN -->
中文日志。
<!-- /lang -->
"#;
        let platforms = HashMap::from([
            (
                "windows-x86_64".to_string(),
                UpdaterPlatform {
                    url: "https://example.com/FileNavigation.exe".to_string(),
                    signature: "signature".to_string(),
                },
            ),
            (
                "windows-x86_64-nsis".to_string(),
                UpdaterPlatform {
                    url: "https://example.com/FileNavigation.exe".to_string(),
                    signature: "signature".to_string(),
                },
            ),
        ]);
        let release = release_info_from_manifest(UpdaterManifest {
            version: "999.0.0".to_string(),
            notes: notes.to_string(),
            pub_date: Some("2026-07-18T00:00:00Z".to_string()),
            platforms,
        });
        let response = build_update_response(&release, "zh-CN").expect("valid update response");

        assert!(response.has_update);
        assert_eq!(response.release_notes, "中文日志。");
        assert_eq!(response.assets.len(), 1);
        assert_eq!(response.assets[0].name, "FileNavigation.exe");
        assert_eq!(
            response.assets[0].digest.as_deref(),
            Some("minisign:signature")
        );
    }
}
