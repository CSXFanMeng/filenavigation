use std::{
    collections::VecDeque,
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{Instant, SystemTime},
};

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct SearchRequest {
    root: String,
    query: String,
    case_sensitive: bool,
    include_hidden: bool,
    max_results: usize,
}

#[derive(Debug, Serialize)]
struct SearchResponse {
    results: Vec<SearchResult>,
    stats: SearchStats,
    truncated: bool,
}

#[derive(Debug, Serialize)]
struct SearchStats {
    files_scanned: u64,
    directories_scanned: u64,
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

#[tauri::command]
async fn search_files(request: SearchRequest) -> Result<SearchResponse, String> {
    tokio::task::spawn_blocking(move || perform_search(request))
        .await
        .map_err(|error| format!("搜索任务失败: {error}"))?
}

#[tauri::command]
async fn open_path(path: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || open_path_native(&path))
        .await
        .map_err(|error| format!("打开任务失败: {error}"))?
}

fn perform_search(request: SearchRequest) -> Result<SearchResponse, String> {
    let root = PathBuf::from(request.root.trim());
    if !root.is_dir() {
        return Err("搜索目录不存在或不是目录".to_string());
    }

    let max_results = request.max_results.clamp(10, 5_000);
    let started = Instant::now();
    let needle = normalize(&request.query, request.case_sensitive);
    let mut queue = VecDeque::from([root]);
    let mut results = Vec::new();
    let mut files_scanned = 0;
    let mut directories_scanned = 0;
    let mut truncated = false;

    while let Some(directory) = queue.pop_front() {
        directories_scanned += 1;
        let entries = match fs::read_dir(&directory) {
            Ok(entries) => entries,
            Err(_) => continue,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();

            if !request.include_hidden && is_hidden(&path, &file_name) {
                continue;
            }

            let metadata = match entry.metadata() {
                Ok(metadata) => metadata,
                Err(_) => continue,
            };

            let is_dir = metadata.is_dir();
            if is_dir {
                queue.push_back(path.clone());
            } else {
                files_scanned += 1;
            }

            let haystack = normalize(&file_name, request.case_sensitive);
            if haystack.contains(&needle) {
                results.push(to_result(path, file_name, metadata, is_dir));
                if results.len() >= max_results {
                    truncated = true;
                    break;
                }
            }
        }

        if truncated {
            break;
        }
    }

    Ok(SearchResponse {
        results,
        stats: SearchStats {
            files_scanned,
            directories_scanned,
            elapsed_ms: started.elapsed().as_millis(),
        },
        truncated,
    })
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
        kind: if is_dir { "目录" } else { "文件" }.to_string(),
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
        .map_err(|error| format!("无法打开路径: {error}"))
}

#[cfg(target_os = "macos")]
fn open_path_native(path: &str) -> Result<(), String> {
    Command::new("open")
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("无法打开路径: {error}"))
}

#[cfg(all(target_family = "unix", not(target_os = "macos")))]
fn open_path_native(path: &str) -> Result<(), String> {
    Command::new("xdg-open")
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("无法打开路径: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![search_files, open_path])
        .run(tauri::generate_context!())
        .expect("error while running FileNavigation");
}
