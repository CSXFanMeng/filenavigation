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
    time::{Instant, SystemTime},
};

use chrono::{DateTime, Local};
use semver::Version;
use serde::{Deserialize, Serialize};
use tauri::Emitter;

const LATEST_RELEASE_URL: &str =
    "https://api.github.com/repos/CSXFanMeng/filenavigation/releases/latest";
const RELEASE_USER_AGENT: &str = "FileNavigation update checker";

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

#[derive(Debug, Serialize)]
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

#[derive(Debug, Serialize)]
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
async fn check_for_updates(language: String) -> Result<UpdateResponse, String> {
    let release = reqwest::Client::new()
        .get(LATEST_RELEASE_URL)
        .header(reqwest::header::USER_AGENT, RELEASE_USER_AGENT)
        .send()
        .await
        .map_err(|_| "updateNetworkFailed".to_string())?;

    if release.status() == reqwest::StatusCode::FORBIDDEN {
        return Err("updateRateLimited".to_string());
    }

    if release.status() == reqwest::StatusCode::NOT_FOUND {
        return Err("updateNotFound".to_string());
    }

    let release = release
        .error_for_status()
        .map_err(|_| "updateCheckFailed".to_string())?
        .json::<GitHubRelease>()
        .await
        .map_err(|_| "updateCheckFailed".to_string())?;

    let current_version = env!("CARGO_PKG_VERSION").to_string();
    let latest_version = release.tag_name.trim_start_matches('v').to_string();
    let current =
        Version::parse(&current_version).map_err(|_| "versionCompareFailed".to_string())?;
    let latest = Version::parse(&latest_version).map_err(|_| "versionCompareFailed".to_string())?;

    let raw_notes = release.body.unwrap_or_default();
    let (release_notes, release_language) = localized_release_notes(&raw_notes, &language);

    Ok(UpdateResponse {
        current_version,
        latest_version: latest_version.clone(),
        has_update: latest > current,
        release_name: release.name.unwrap_or_else(|| release.tag_name.clone()),
        release_notes,
        release_language,
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
        .plugin(tauri_plugin_dialog::init())
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
    use super::localized_release_notes;

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
}
