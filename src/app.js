import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./styles.css";

const elements = {
  rootPath: document.querySelector("#root-path"),
  query: document.querySelector("#query"),
  pickDir: document.querySelector("#pick-dir"),
  caseSensitive: document.querySelector("#case-sensitive"),
  includeHidden: document.querySelector("#include-hidden"),
  maxResults: document.querySelector("#max-results"),
  search: document.querySelector("#search"),
  title: document.querySelector("#status-title"),
  statFiles: document.querySelector("#stat-files"),
  statDirs: document.querySelector("#stat-dirs"),
  statMs: document.querySelector("#stat-ms"),
  emptyState: document.querySelector("#empty-state"),
  resultList: document.querySelector("#result-list")
};

let debounceTimer = 0;
let activeSearchId = 0;

elements.pickDir.addEventListener("click", async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "选择搜索目录"
  });

  if (typeof selected === "string") {
    elements.rootPath.value = selected;
    scheduleSearch();
  }
});

elements.search.addEventListener("click", () => runSearch());
elements.query.addEventListener("input", () => scheduleSearch());
elements.rootPath.addEventListener("input", () => scheduleSearch());
elements.caseSensitive.addEventListener("change", () => scheduleSearch());
elements.includeHidden.addEventListener("change", () => scheduleSearch());
elements.maxResults.addEventListener("change", () => scheduleSearch());

function scheduleSearch() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => runSearch(), 280);
}

async function runSearch() {
  const root = elements.rootPath.value.trim();
  const query = elements.query.value.trim();

  if (!root || !query) {
    setStatus("等待搜索", 0, 0, 0);
    renderEmpty("输入目录和关键字后开始查找", "搜索在本机完成，不上传文件名、路径或内容。");
    return;
  }

  const searchId = ++activeSearchId;
  elements.search.disabled = true;
  elements.title.textContent = "正在查找...";
  elements.emptyState.hidden = true;
  elements.resultList.innerHTML = "";

  try {
    const response = await invoke("search_files", {
      request: {
        root,
        query,
        case_sensitive: elements.caseSensitive.checked,
        include_hidden: elements.includeHidden.checked,
        max_results: Number(elements.maxResults.value || 500)
      }
    });

    if (searchId !== activeSearchId) {
      return;
    }

    setStatus(
      response.truncated ? `找到 ${response.results.length} 个结果，已达上限` : `找到 ${response.results.length} 个结果`,
      response.stats.files_scanned,
      response.stats.directories_scanned,
      response.stats.elapsed_ms
    );

    if (response.results.length === 0) {
      renderEmpty("没有匹配结果", "换一个关键字，或启用隐藏文件搜索。");
    } else {
      renderResults(response.results);
    }
  } catch (error) {
    if (searchId === activeSearchId) {
      setStatus("搜索失败", 0, 0, 0);
      renderEmpty("无法完成搜索", String(error));
    }
  } finally {
    if (searchId === activeSearchId) {
      elements.search.disabled = false;
    }
  }
}

function setStatus(title, files, dirs, elapsedMs) {
  elements.title.textContent = title;
  elements.statFiles.textContent = files.toLocaleString();
  elements.statDirs.textContent = dirs.toLocaleString();
  elements.statMs.textContent = `${elapsedMs.toLocaleString()} ms`;
}

function renderEmpty(title, text) {
  elements.emptyState.hidden = false;
  elements.emptyState.querySelector("h3").textContent = title;
  elements.emptyState.querySelector("p").textContent = text;
  elements.resultList.innerHTML = "";
}

function renderResults(results) {
  elements.emptyState.hidden = true;
  const fragment = document.createDocumentFragment();

  for (const result of results) {
    const row = document.createElement("article");
    row.className = "result-row";

    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.textContent = result.is_dir ? "DIR" : "FILE";

    const content = document.createElement("div");
    content.className = "result-content";

    const name = document.createElement("button");
    name.className = "result-name";
    name.type = "button";
    name.textContent = result.name;
    name.addEventListener("click", () => openPath(result.path));

    const path = document.createElement("p");
    path.className = "result-path";
    path.textContent = result.path;

    const meta = document.createElement("p");
    meta.className = "result-meta";
    meta.textContent = `${result.kind} · ${formatBytes(result.size)} · ${result.modified ?? "未知时间"}`;

    content.append(name, path, meta);
    row.append(icon, content);
    fragment.append(row);
  }

  elements.resultList.replaceChildren(fragment);
}

async function openPath(path) {
  try {
    await invoke("open_path", { path });
  } catch (error) {
    elements.title.textContent = `打开失败: ${error}`;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 100 || index === 0 ? 0 : 1)} ${units[index]}`;
}
