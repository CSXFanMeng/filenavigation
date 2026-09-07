use std::{
    collections::{HashMap, HashSet, VecDeque},
    fs::{self, File},
    io::{BufReader, Read},
    path::{Path, PathBuf},
    process::Command,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use chrono::{DateTime, Local};
use regex::{Regex, RegexBuilder};
use semver::Version;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256, Sha512};
use tauri::{Emitter, Manager};

const UPDATER_MANIFEST_URLS: [&str; 3] = [
    "https://cdn.statically.io/gh/CSXFanMeng/filenavigation/master/updates/latest.json",
    "https://raw.githubusercontent.com/CSXFanMeng/filenavigation/master/updates/latest.json",
    "https://github.com/CSXFanMeng/filenavigation/releases/latest/download/latest.json",
];
const RELEASE_TAG_URL: &str = "https://github.com/CSXFanMeng/filenavigation/releases/tag";
const RELEASE_USER_AGENT: &str = "FileNavigation update checker";
const RELEASE_CACHE_TTL: Duration = Duration::from_secs(15 * 60);
const RELEASE_CACHE_FILE: &str = "update-release-cache.json";

#[derive(Debug, Deserialize)]
struct SearchRequest {
    search_id: String,
    root: String,
    query: String,
    case_sensitive: bool,
    #[serde(default)]
    use_regex: bool,
    include_hidden: bool,
}

#[derive(Debug, Serialize)]
struct SearchResponse {
    search_id: String,
    results: Vec<SearchResult>,
    stats: SearchStats,
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
    relative_path: String,
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

#[derive(Default)]
struct IntegritySessions {
    cancel_tokens: Mutex<HashMap<String, Arc<AtomicBool>>>,
}

#[derive(Debug, Deserialize)]
struct IntegrityRequest {
    operation_id: String,
    source: String,
    path: String,
    #[serde(default)]
    paths: Vec<String>,
    root: Option<String>,
    algorithm: String,
    expected_hash: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
struct IntegrityProgress {
    operation_id: String,
    bytes_read: u64,
    total_bytes: u64,
    files_completed: usize,
    total_files: usize,
    current_path: String,
    elapsed_ms: u128,
}

#[derive(Debug, Serialize)]
struct IntegrityFileResult {
    path: String,
    relative_path: String,
    hash: String,
    size: u64,
}

#[derive(Debug, Serialize)]
struct IntegrityResponse {
    operation_id: String,
    path: String,
    algorithm: String,
    aggregate_hash: String,
    expected_hash: Option<String>,
    matches: Option<bool>,
    files: Vec<IntegrityFileResult>,
    total_files: usize,
    bytes_read: u64,
    total_bytes: u64,
    elapsed_ms: u128,
    cancelled: bool,
}

enum IntegrityHasher {
    Sha256(Sha256),
    Sha512(Sha512),
}

impl IntegrityHasher {
    fn new(algorithm: &str) -> Result<Self, String> {
        match algorithm {
            "sha256" => Ok(Self::Sha256(Sha256::new())),
            "sha512" => Ok(Self::Sha512(Sha512::new())),
            _ => Err("unsupportedHashAlgorithm".to_string()),
        }
    }

    fn expected_hex_length(&self) -> usize {
        match self {
            Self::Sha256(_) => 64,
            Self::Sha512(_) => 128,
        }
    }

    fn update(&mut self, bytes: &[u8]) {
        match self {
            Self::Sha256(hasher) => hasher.update(bytes),
            Self::Sha512(hasher) => hasher.update(bytes),
        }
    }

    fn finalize(self) -> String {
        match self {
            Self::Sha256(hasher) => format!("{:x}", hasher.finalize()),
            Self::Sha512(hasher) => format!("{:x}", hasher.finalize()),
        }
    }
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
    fetched_at: SystemTime,
    release: ReleaseInfo,
}

#[derive(Clone, Serialize, Deserialize)]
struct ReleaseInfo {
    latest_version: String,
    release_name: String,
    raw_notes: String,
    release_url: String,
    published_at: Option<String>,
    assets: Vec<UpdateAsset>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdaterManifest {
    version: String,
    #[serde(default)]
    notes: String,
    pub_date: Option<String>,
    #[serde(default)]
    platforms: HashMap<String, UpdaterPlatform>,
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
struct UpdateAsset {
    name: String,
    size: u64,
    download_url: String,
    digest: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct PersistedRelease {
    fetched_at_unix: u64,
    release: ReleaseInfo,
}

enum NameMatcher {
    Plain {
        needle: String,
        case_sensitive: bool,
    },
    Regex(Regex),
}

impl NameMatcher {
    fn new(query: &str, case_sensitive: bool, use_regex: bool) -> Result<Self, String> {
        if use_regex {
            return RegexBuilder::new(query)
                .case_insensitive(!case_sensitive)
                .build()
                .map(Self::Regex)
                .map_err(|_| "invalidRegex".to_string());
        }

        Ok(Self::Plain {
            needle: normalize(query, case_sensitive),
            case_sensitive,
        })
    }

    fn is_match(&self, file_name: &str) -> bool {
        match self {
            Self::Plain {
                needle,
                case_sensitive,
            } => normalize(file_name, *case_sensitive).contains(needle),
            Self::Regex(regex) => regex.is_match(file_name),
        }
    }
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
async fn verify_file_integrity(
    app: tauri::AppHandle,
    state: tauri::State<'_, IntegritySessions>,
    request: IntegrityRequest,
) -> Result<IntegrityResponse, String> {
    let operation_id = request.operation_id.clone();
    let cancel_token = Arc::new(AtomicBool::new(false));
    state
        .cancel_tokens
        .lock()
        .map_err(|_| "integrityTaskFailed".to_string())?
        .insert(operation_id.clone(), cancel_token.clone());

    let result =
        tokio::task::spawn_blocking(move || perform_integrity_check(app, request, cancel_token))
            .await
            .map_err(|_| "integrityTaskFailed".to_string())?;

    state
        .cancel_tokens
        .lock()
        .map_err(|_| "integrityTaskFailed".to_string())?
        .remove(&operation_id);

    result
}

#[tauri::command]
fn cancel_integrity_check(
    state: tauri::State<'_, IntegritySessions>,
    operation_id: String,
) -> Result<(), String> {
    if let Some(cancel_token) = state
        .cancel_tokens
        .lock()
        .map_err(|_| "integrityTaskFailed".to_string())?
        .get(&operation_id)
    {
        cancel_token.store(true, Ordering::Relaxed);
    }

    Ok(())
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
    app: tauri::AppHandle,
    state: tauri::State<'_, UpdateChecker>,
    language: String,
) -> Result<UpdateResponse, String> {
    hydrate_update_cache(&app, &state).await;

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
                fetched_at: SystemTime::now(),
                release: release.clone(),
            });
            persist_update_cache(&app, &release).await;
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
        let elapsed = SystemTime::now()
            .duration_since(cached.fetched_at)
            .unwrap_or_default();
        let fresh_enough = max_age.is_none_or(|age| elapsed <= age);
        fresh_enough.then(|| cached.release.clone())
    }))
}

async fn hydrate_update_cache(app: &tauri::AppHandle, state: &UpdateChecker) {
    if cached_release(state, None).ok().flatten().is_some() {
        return;
    }

    let Some(cached) = load_persisted_update_cache(app).await else {
        return;
    };

    if let Ok(mut memory_cache) = state.cached_release.lock()
        && memory_cache.is_none()
    {
        *memory_cache = Some(cached);
    }
}

async fn load_persisted_update_cache(app: &tauri::AppHandle) -> Option<CachedRelease> {
    let path = update_cache_path(app).ok()?;
    let bytes = tokio::fs::read(path).await.ok()?;
    let persisted = serde_json::from_slice::<PersistedRelease>(&bytes).ok()?;

    Some(CachedRelease {
        fetched_at: UNIX_EPOCH + Duration::from_secs(persisted.fetched_at_unix),
        release: persisted.release,
    })
}

async fn persist_update_cache(app: &tauri::AppHandle, release: &ReleaseInfo) {
    let Ok(path) = update_cache_path(app) else {
        return;
    };
    let Some(parent) = path.parent() else {
        return;
    };
    let fetched_at_unix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let persisted = PersistedRelease {
        fetched_at_unix,
        release: release.clone(),
    };
    let Ok(bytes) = serde_json::to_vec(&persisted) else {
        return;
    };

    if tokio::fs::create_dir_all(parent).await.is_ok() {
        let _ = tokio::fs::write(path, bytes).await;
    }
}

fn update_cache_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_cache_dir()
        .map(|directory| directory.join(RELEASE_CACHE_FILE))
        .map_err(|_| "updateCheckFailed".to_string())
}

async fn fetch_release_info(client: &reqwest::Client) -> Result<ReleaseInfo, String> {
    fetch_updater_manifest(client)
        .await
        .map(release_info_from_manifest)
}

async fn fetch_updater_manifest(client: &reqwest::Client) -> Result<UpdaterManifest, String> {
    let mut last_error = "updateCheckFailed".to_string();
    for attempt in 0..2 {
        let mut requests = tokio::task::JoinSet::new();
        for url in UPDATER_MANIFEST_URLS {
            let request_client = client.clone();
            requests.spawn(async move { fetch_updater_manifest_once(&request_client, url).await });
        }

        let mut best_manifest: Option<UpdaterManifest> = None;
        loop {
            let wait = if best_manifest.is_some() {
                Duration::from_secs(2)
            } else {
                Duration::from_secs(11)
            };
            let Ok(next_result) = tokio::time::timeout(wait, requests.join_next()).await else {
                break;
            };
            let Some(result) = next_result else {
                break;
            };

            match result {
                Ok(Ok(manifest)) => {
                    let replace = best_manifest
                        .as_ref()
                        .is_none_or(|best| manifest_version(&manifest) > manifest_version(best));
                    if replace {
                        best_manifest = Some(manifest);
                    }
                }
                Ok(Err(error)) => last_error = error,
                Err(_) => last_error = "updateNetworkFailed".to_string(),
            }
        }

        if let Some(manifest) = best_manifest {
            return Ok(manifest);
        }

        if attempt == 0 {
            tokio::time::sleep(Duration::from_millis(500)).await;
        }
    }

    Err(last_error)
}

fn manifest_version(manifest: &UpdaterManifest) -> Version {
    Version::parse(manifest.version.trim_start_matches('v'))
        .unwrap_or_else(|_| Version::new(0, 0, 0))
}

async fn fetch_updater_manifest_once(
    client: &reqwest::Client,
    url: &'static str,
) -> Result<UpdaterManifest, String> {
    let response = client
        .get(url)
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
    if let Some(base) = language.split('-').next()
        && base != language
    {
        candidates.push(base.to_string());
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

fn perform_integrity_check(
    app: tauri::AppHandle,
    request: IntegrityRequest,
    cancel_token: Arc<AtomicBool>,
) -> Result<IntegrityResponse, String> {
    const BUFFER_SIZE: usize = 1024 * 1024;

    let started = Instant::now();
    let algorithm = request.algorithm.to_ascii_lowercase();
    let expected_hex_length = IntegrityHasher::new(&algorithm)?.expected_hex_length();
    let expected_hash =
        normalize_expected_hash(request.expected_hash.as_deref(), expected_hex_length)?;
    let (root, targets) = match collect_integrity_targets(&request, &cancel_token) {
        Ok(targets) => targets,
        Err(error) if error == "integrityCancelled" => {
            return Ok(cancelled_integrity_response(
                request,
                algorithm,
                expected_hash,
                Vec::new(),
                IntegrityProgress {
                    operation_id: String::new(),
                    bytes_read: 0,
                    total_bytes: 0,
                    files_completed: 0,
                    total_files: 0,
                    current_path: String::new(),
                    elapsed_ms: started.elapsed().as_millis(),
                },
            ));
        }
        Err(error) => return Err(error),
    };
    let total_files = targets.len();
    let total_bytes = targets.iter().try_fold(0_u64, |total, path| {
        if cancel_token.load(Ordering::Relaxed) {
            return Err("integrityCancelled".to_string());
        }
        let size = path
            .metadata()
            .map_err(|_| "fileReadFailed".to_string())?
            .len();
        Ok::<u64, String>(total.saturating_add(size))
    });
    let total_bytes = match total_bytes {
        Ok(total) => total,
        Err(error) if error == "integrityCancelled" => {
            return Ok(cancelled_integrity_response(
                request,
                algorithm,
                expected_hash,
                Vec::new(),
                IntegrityProgress {
                    operation_id: String::new(),
                    bytes_read: 0,
                    total_bytes: 0,
                    files_completed: 0,
                    total_files,
                    current_path: String::new(),
                    elapsed_ms: started.elapsed().as_millis(),
                },
            ));
        }
        Err(error) => return Err(error),
    };
    let mut buffer = vec![0_u8; BUFFER_SIZE];
    let mut bytes_read = 0_u64;
    let mut last_emit = Instant::now();
    let mut files = Vec::with_capacity(total_files);

    for (index, path) in targets.iter().enumerate() {
        let initial_metadata = path.metadata().map_err(|_| "fileReadFailed".to_string())?;
        let mut reader = BufReader::with_capacity(
            BUFFER_SIZE,
            File::open(path).map_err(|_| "fileReadFailed".to_string())?,
        );
        let mut file_hasher = IntegrityHasher::new(&algorithm)?;

        loop {
            if cancel_token.load(Ordering::Relaxed) {
                let progress = IntegrityProgress {
                    operation_id: request.operation_id.clone(),
                    bytes_read,
                    total_bytes,
                    files_completed: index,
                    total_files,
                    current_path: path.to_string_lossy().to_string(),
                    elapsed_ms: started.elapsed().as_millis(),
                };
                let _ = app.emit("integrity-progress", progress.clone());
                return Ok(cancelled_integrity_response(
                    request,
                    algorithm,
                    expected_hash,
                    files,
                    progress,
                ));
            }

            let count = reader
                .read(&mut buffer)
                .map_err(|_| "fileReadFailed".to_string())?;
            if count == 0 {
                break;
            }

            file_hasher.update(&buffer[..count]);
            bytes_read += count as u64;
            if last_emit.elapsed().as_millis() >= 100 {
                let _ = app.emit(
                    "integrity-progress",
                    IntegrityProgress {
                        operation_id: request.operation_id.clone(),
                        bytes_read,
                        total_bytes,
                        files_completed: index,
                        total_files,
                        current_path: path.to_string_lossy().to_string(),
                        elapsed_ms: started.elapsed().as_millis(),
                    },
                );
                last_emit = Instant::now();
            }
        }

        let final_metadata = path.metadata().map_err(|_| "fileReadFailed".to_string())?;
        if initial_metadata.len() != final_metadata.len()
            || initial_metadata.modified().ok() != final_metadata.modified().ok()
        {
            return Err("fileChangedDuringCheck".to_string());
        }

        files.push(IntegrityFileResult {
            path: path.to_string_lossy().to_string(),
            relative_path: relative_path(&root, path),
            hash: file_hasher.finalize(),
            size: final_metadata.len(),
        });
    }

    if request.source == "folder" {
        let (_, current_targets) = match collect_integrity_targets(&request, &cancel_token) {
            Ok(targets) => targets,
            Err(error) if error == "integrityCancelled" => {
                return Ok(cancelled_integrity_response(
                    request,
                    algorithm,
                    expected_hash,
                    files,
                    IntegrityProgress {
                        operation_id: String::new(),
                        bytes_read,
                        total_bytes,
                        files_completed: total_files,
                        total_files,
                        current_path: String::new(),
                        elapsed_ms: started.elapsed().as_millis(),
                    },
                ));
            }
            Err(error) => return Err(error),
        };
        if current_targets != targets {
            return Err("fileChangedDuringCheck".to_string());
        }
    }

    let aggregate_hash = aggregate_integrity_hash(&algorithm, &files)?;
    let matches = expected_hash
        .as_ref()
        .map(|expected| expected == &aggregate_hash);
    let _ = app.emit(
        "integrity-progress",
        IntegrityProgress {
            operation_id: request.operation_id.clone(),
            bytes_read,
            total_bytes,
            files_completed: total_files,
            total_files,
            current_path: String::new(),
            elapsed_ms: started.elapsed().as_millis(),
        },
    );

    Ok(IntegrityResponse {
        operation_id: request.operation_id,
        path: request.path,
        algorithm,
        aggregate_hash,
        expected_hash,
        matches,
        files,
        total_files,
        bytes_read,
        total_bytes,
        elapsed_ms: started.elapsed().as_millis(),
        cancelled: false,
    })
}

fn cancelled_integrity_response(
    request: IntegrityRequest,
    algorithm: String,
    expected_hash: Option<String>,
    files: Vec<IntegrityFileResult>,
    progress: IntegrityProgress,
) -> IntegrityResponse {
    IntegrityResponse {
        operation_id: request.operation_id,
        path: request.path,
        algorithm,
        aggregate_hash: String::new(),
        expected_hash,
        matches: None,
        files,
        total_files: progress.total_files,
        bytes_read: progress.bytes_read,
        total_bytes: progress.total_bytes,
        elapsed_ms: progress.elapsed_ms,
        cancelled: true,
    }
}

fn collect_integrity_targets(
    request: &IntegrityRequest,
    cancel_token: &AtomicBool,
) -> Result<(PathBuf, Vec<PathBuf>), String> {
    if cancel_token.load(Ordering::Relaxed) {
        return Err("integrityCancelled".to_string());
    }

    let mut targets = match request.source.as_str() {
        "file" => {
            let path = PathBuf::from(request.path.trim());
            if !path.is_file() {
                return Err("invalidFile".to_string());
            }
            vec![path]
        }
        "folder" => {
            let root = PathBuf::from(request.path.trim());
            if !root.is_dir() {
                return Err("invalidDirectory".to_string());
            }
            collect_folder_files(&root, cancel_token)?
        }
        "filtered" => {
            if request.paths.is_empty() {
                return Err("noFilteredFiles".to_string());
            }
            request
                .paths
                .iter()
                .map(|path| PathBuf::from(path.trim()))
                .collect()
        }
        _ => return Err("invalidIntegritySource".to_string()),
    };

    let mut unique = HashSet::new();
    targets.retain(|path| unique.insert(path.clone()));
    if targets.iter().any(|path| !path.is_file()) {
        return Err("invalidFile".to_string());
    }

    let root = match request.source.as_str() {
        "file" => targets[0]
            .parent()
            .unwrap_or_else(|| Path::new(""))
            .to_path_buf(),
        "folder" => PathBuf::from(request.path.trim()),
        "filtered" => request
            .root
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(PathBuf::from)
            .unwrap_or_default(),
        _ => unreachable!(),
    };

    targets.sort_by(|left, right| {
        relative_path(&root, left)
            .to_lowercase()
            .cmp(&relative_path(&root, right).to_lowercase())
            .then_with(|| relative_path(&root, left).cmp(&relative_path(&root, right)))
    });
    Ok((root, targets))
}

fn collect_folder_files(root: &Path, cancel_token: &AtomicBool) -> Result<Vec<PathBuf>, String> {
    let mut queue = VecDeque::from([root.to_path_buf()]);
    let mut files = Vec::new();

    while let Some(directory) = queue.pop_front() {
        if cancel_token.load(Ordering::Relaxed) {
            return Err("integrityCancelled".to_string());
        }
        let entries = fs::read_dir(directory).map_err(|_| "folderReadFailed".to_string())?;
        for entry in entries {
            if cancel_token.load(Ordering::Relaxed) {
                return Err("integrityCancelled".to_string());
            }
            let entry = entry.map_err(|_| "folderReadFailed".to_string())?;
            let file_type = entry
                .file_type()
                .map_err(|_| "folderReadFailed".to_string())?;
            if file_type.is_dir() {
                queue.push_back(entry.path());
            } else if file_type.is_file() {
                files.push(entry.path());
            }
        }
    }

    Ok(files)
}

fn aggregate_integrity_hash(
    algorithm: &str,
    files: &[IntegrityFileResult],
) -> Result<String, String> {
    if files.len() == 1 {
        return Ok(files[0].hash.clone());
    }

    let mut hasher = IntegrityHasher::new(algorithm)?;
    for file in files {
        hasher.update(file.relative_path.as_bytes());
        hasher.update(&[0]);
        hasher.update(file.hash.as_bytes());
        hasher.update(b"\n");
    }
    Ok(hasher.finalize())
}

fn normalize_expected_hash(
    value: Option<&str>,
    expected_length: usize,
) -> Result<Option<String>, String> {
    let Some(value) = value else {
        return Ok(None);
    };
    let normalized = value
        .chars()
        .filter(|character| !character.is_whitespace())
        .collect::<String>()
        .to_ascii_lowercase();

    if normalized.is_empty() {
        return Ok(None);
    }
    if normalized.len() != expected_length
        || !normalized
            .chars()
            .all(|character| character.is_ascii_hexdigit())
    {
        return Err("invalidExpectedHash".to_string());
    }

    Ok(Some(normalized))
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

    let search_id = request.search_id.clone();
    let started = Instant::now();
    let matcher = NameMatcher::new(
        request.query.trim(),
        request.case_sensitive,
        request.use_regex,
    )?;
    let search_root = root.clone();
    let mut queue = VecDeque::from([root]);
    let mut results = Vec::new();
    let mut files_scanned = 0;
    let mut directories_scanned = 0;
    let mut skipped_entries = 0;
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

            if matcher.is_match(&file_name) {
                results.push(to_result(
                    &search_root,
                    path.clone(),
                    file_name,
                    metadata,
                    is_dir,
                ));
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

        if cancelled {
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

fn to_result(
    root: &Path,
    path: PathBuf,
    name: String,
    metadata: fs::Metadata,
    is_dir: bool,
) -> SearchResult {
    SearchResult {
        name,
        path: path.to_string_lossy().to_string(),
        relative_path: relative_path(root, &path),
        kind: if is_dir { "directory" } else { "file" }.to_string(),
        is_dir,
        size: if is_dir { 0 } else { metadata.len() },
        modified: metadata.modified().ok().map(format_system_time),
    }
}

fn relative_path(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .unwrap_or(path)
        .components()
        .map(|component| component.as_os_str().to_string_lossy())
        .collect::<Vec<_>>()
        .join("/")
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
        .manage(IntegritySessions::default())
        .manage(UpdateChecker::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            search_files,
            cancel_search,
            verify_file_integrity,
            cancel_integrity_check,
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
        IntegrityFileResult, IntegrityHasher, NameMatcher, UPDATER_MANIFEST_URLS, UpdateChecker,
        UpdaterManifest, UpdaterPlatform, aggregate_integrity_hash, build_update_response,
        fetch_updater_manifest_once, localized_release_notes, manifest_version,
        normalize_expected_hash, relative_path, release_info_from_manifest,
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

    #[test]
    fn compares_mirror_versions_semantically() {
        let manifest = |version: &str| UpdaterManifest {
            version: version.to_string(),
            notes: String::new(),
            pub_date: None,
            platforms: HashMap::new(),
        };

        assert!(manifest_version(&manifest("0.1.10")) > manifest_version(&manifest("0.1.9")));
    }

    #[test]
    fn plain_file_name_search_treats_regex_tokens_literally() {
        let matcher = NameMatcher::new("report.*", false, false).expect("plain matcher");

        assert!(matcher.is_match("REPORT.*.txt"));
        assert!(!matcher.is_match("report-2026.txt"));
    }

    #[test]
    fn regex_file_name_search_respects_case_setting() {
        let insensitive =
            NameMatcher::new(r"^report_\d{4}\.pdf$", false, true).expect("case-insensitive regex");
        let sensitive =
            NameMatcher::new(r"^report_\d{4}\.pdf$", true, true).expect("case-sensitive regex");

        assert!(insensitive.is_match("REPORT_2026.PDF"));
        assert!(!sensitive.is_match("REPORT_2026.PDF"));
    }

    #[test]
    fn invalid_regex_is_rejected_before_scanning() {
        assert_eq!(
            NameMatcher::new("[unfinished", false, true)
                .err()
                .as_deref(),
            Some("invalidRegex")
        );
    }

    #[test]
    fn empty_plain_query_matches_every_file_name() {
        let matcher = NameMatcher::new("", false, false).expect("empty plain matcher");

        assert!(matcher.is_match("report.pdf"));
        assert!(matcher.is_match("nested-folder"));
    }

    #[test]
    fn result_paths_are_relative_to_the_selected_root() {
        let root = std::path::PathBuf::from("search-root");
        let nested = root.join("xx").join("123").join("abc").join("report.pdf");

        assert_eq!(relative_path(&root, &nested), "xx/123/abc/report.pdf");
    }

    #[test]
    fn sha256_matches_known_test_vector() {
        let mut hasher = IntegrityHasher::new("sha256").expect("supported algorithm");
        hasher.update(b"abc");

        assert_eq!(
            hasher.finalize(),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn sha512_matches_known_test_vector() {
        let mut hasher = IntegrityHasher::new("sha512").expect("supported algorithm");
        hasher.update(b"abc");

        assert_eq!(
            hasher.finalize(),
            concat!(
                "ddaf35a193617abacc417349ae204131",
                "12e6fa4e89a97ea20a9eeee64b55d39a",
                "2192992a274fc1a836ba3c23a3feebbd",
                "454d4423643ce80e2a9ac94fa54ca49f"
            )
        );
    }

    #[test]
    fn expected_fingerprint_ignores_whitespace_and_validates_length() {
        let value =
            "BA78 16BF 8F01 CFEA 4141 40DE 5DAE 2223 B003 61A3 9617 7A9C B410 FF61 F200 15AD";

        assert_eq!(
            normalize_expected_hash(Some(value), 64).expect("valid fingerprint"),
            Some("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad".to_string())
        );
        assert_eq!(
            normalize_expected_hash(Some("not-a-hash"), 64).expect_err("invalid fingerprint"),
            "invalidExpectedHash"
        );
    }

    #[test]
    fn aggregate_fingerprint_changes_when_relative_paths_change() {
        let file = |relative_path: &str| IntegrityFileResult {
            path: relative_path.to_string(),
            relative_path: relative_path.to_string(),
            hash: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad".to_string(),
            size: 3,
        };

        let first =
            aggregate_integrity_hash("sha256", &[file("one.txt"), file("two.txt")]).expect("hash");
        let renamed = aggregate_integrity_hash("sha256", &[file("one.txt"), file("renamed.txt")])
            .expect("hash");

        assert_ne!(first, renamed);
    }

    #[tokio::test]
    #[ignore = "requires network access"]
    async fn live_updater_mirrors_are_reachable() {
        let client = UpdateChecker::default().client;
        let mut reachable = 0;

        for url in UPDATER_MANIFEST_URLS {
            if fetch_updater_manifest_once(&client, url).await.is_ok() {
                reachable += 1;
            }
        }

        assert!(
            reachable >= 2,
            "only {reachable} updater mirror was reachable"
        );
    }
}
