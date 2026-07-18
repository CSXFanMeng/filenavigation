import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check as checkForAppUpdate } from "@tauri-apps/plugin-updater";
import { siGithub } from "simple-icons";
import {
  ArrowUpDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  File as FileIcon,
  Files,
  FileType,
  Filter,
  Folder as FolderIcon,
  FolderOpen,
  FolderSearch,
  Folders,
  FolderTree,
  GitBranch,
  HardDrive,
  Languages,
  ListFilter,
  ListOrdered,
  Maximize2,
  Minus,
  Moon,
  PackageCheck,
  Palette,
  Radar,
  RefreshCw,
  ScanLine,
  ScanSearch,
  Search,
  SearchX,
  Settings2,
  ShieldAlert,
  Sun,
  Timer,
  X,
  createElement as createIconElement,
  createIcons
} from "lucide";
import { languageOptions, resolveLanguage as resolveLocaleLanguage, translateForLanguage } from "./i18n/index.js";
import "./styles.css";

const uiIcons = {
  ArrowUpDown,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Files,
  FileType,
  Filter,
  FolderOpen,
  FolderSearch,
  Folders,
  FolderTree,
  GitBranch,
  HardDrive,
  Languages,
  ListFilter,
  ListOrdered,
  Maximize2,
  Minus,
  Moon,
  Palette,
  Radar,
  RefreshCw,
  ScanLine,
  ScanSearch,
  Search,
  SearchX,
  Settings2,
  ShieldAlert,
  Sun,
  Timer,
  X
};

const elements = {
  openUpdates: document.querySelector("#open-updates"),
  openSettings: document.querySelector("#open-settings"),
  windowMinimize: document.querySelector("#window-minimize"),
  windowMaximize: document.querySelector("#window-maximize"),
  windowClose: document.querySelector("#window-close"),
  rootPath: document.querySelector("#root-path"),
  query: document.querySelector("#query"),
  pickDir: document.querySelector("#pick-dir"),
  caseSensitive: document.querySelector("#case-sensitive"),
  includeHidden: document.querySelector("#include-hidden"),
  useRegex: document.querySelector("#use-regex"),
  maxResults: document.querySelector("#max-results"),
  language: document.querySelector("#language"),
  search: document.querySelector("#search"),
  cancelSearch: document.querySelector("#cancel-search"),
  resultFilter: document.querySelector("#result-filter"),
  typeFilter: document.querySelector("#type-filter"),
  sortResults: document.querySelector("#sort-results"),
  checkUpdate: document.querySelector("#check-update"),
  title: document.querySelector("#status-title"),
  statFiles: document.querySelector("#stat-files"),
  statDirs: document.querySelector("#stat-dirs"),
  statMs: document.querySelector("#stat-ms"),
  statSkipped: document.querySelector("#stat-skipped"),
  progressDetail: document.querySelector("#progress-detail"),
  emptyState: document.querySelector("#empty-state"),
  resultList: document.querySelector("#result-list"),
  updateStatus: document.querySelector("#update-status"),
  updateDetails: document.querySelector("#update-details"),
  currentVersion: document.querySelector("#current-version"),
  latestVersion: document.querySelector("#latest-version"),
  publishedAt: document.querySelector("#published-at"),
  releaseNotes: document.querySelector("#release-notes"),
  releaseAssets: document.querySelector("#release-assets"),
  automaticUpdate: document.querySelector("#automatic-update"),
  installUpdate: document.querySelector("#install-update"),
  updateProgress: document.querySelector("#update-progress"),
  updateProgressFill: document.querySelector("#update-progress-fill"),
  updateInstallStatus: document.querySelector("#update-install-status"),
  openRelease: document.querySelector("#open-release"),
  updatesDialog: document.querySelector("#updates-dialog"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsNavItems: [...document.querySelectorAll("[data-settings-target]")],
  settingsSections: [...document.querySelectorAll("[data-settings-section]")],
  themeOptions: [...document.querySelectorAll('input[name="theme"]')]
};

const appWindow = isTauri() ? getCurrentWindow() : null;

let debounceTimer = 0;
let activeSearchId = "";
let isSearching = false;
let renderToken = 0;
let currentLanguage = resolveLanguage(localStorage.getItem("filenavigation.language") || "auto");
let lastResults = [];
let lastVisibleResults = [];
let lastStats = { files: 0, dirs: 0, skipped: 0, elapsedMs: 0 };
let lastStatusKey = "waiting";
let lastStatusCount = 0;
let lastStatusTruncated = false;
let lastUpdate = null;
let lastUpdateStatus = "updateIdle";
let lastUpdateError = "";
let isInstallingUpdate = false;
let updateInstallStatusKey = "";
let updateDownloadPercent = 0;
let updateInstallError = "";
let currentTheme = normalizeTheme(localStorage.getItem("filenavigation.theme"));
let activeDialog = null;
let dialogTrigger = null;

initLanguageSelect();
applyTheme(currentTheme, false);
applyTranslations();
initializeIcons();
if (appWindow) {
  initializeProgressListener();
}

elements.windowMinimize.addEventListener("click", () => appWindow?.minimize());
elements.windowMaximize.addEventListener("click", () => appWindow?.toggleMaximize());
elements.windowClose.addEventListener("click", () => appWindow?.close());
elements.openUpdates.addEventListener("click", () => {
  openDialog(elements.updatesDialog, elements.openUpdates);
  if (lastUpdateStatus === "updateIdle") {
    checkForUpdates();
  }
});
elements.openSettings.addEventListener("click", () => openDialog(elements.settingsDialog, elements.openSettings));

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest(".dialog-backdrop")));
});

document.querySelectorAll(".dialog-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("mousedown", (event) => {
    if (event.target === backdrop) {
      closeDialog(backdrop);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeDialog) {
    closeDialog(activeDialog);
  }
});

elements.themeOptions.forEach((option) => {
  option.addEventListener("change", () => {
    if (option.checked) {
      applyTheme(option.value);
    }
  });
});

elements.settingsNavItems.forEach((item, index) => {
  item.addEventListener("click", () => activateSettingsSection(item.dataset.settingsTarget));
  item.addEventListener("keydown", (event) => {
    const previous = event.key === "ArrowUp" || event.key === "ArrowLeft";
    const next = event.key === "ArrowDown" || event.key === "ArrowRight";
    if (!previous && !next && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();
    let targetIndex = index;
    if (event.key === "Home") targetIndex = 0;
    else if (event.key === "End") targetIndex = elements.settingsNavItems.length - 1;
    else targetIndex = (index + (next ? 1 : -1) + elements.settingsNavItems.length) % elements.settingsNavItems.length;

    const target = elements.settingsNavItems[targetIndex];
    activateSettingsSection(target.dataset.settingsTarget, true);
  });
});

elements.pickDir.addEventListener("click", async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: translate("pickDirectory")
  });

  if (typeof selected === "string") {
    elements.rootPath.value = selected;
    scheduleSearch();
  }
});

elements.language.addEventListener("change", () => {
  localStorage.setItem("filenavigation.language", elements.language.value);
  currentLanguage = resolveLanguage(elements.language.value);
  applyTranslations();
  setStatus(
    lastStatusKey,
    lastStats.files,
    lastStats.dirs,
    lastStats.elapsedMs,
    lastStatusCount,
    lastStatusTruncated,
    lastStats.skipped
  );
  applyResultView();
  lastUpdate = null;
  lastUpdateStatus = "updateIdle";
  lastUpdateError = "";
  renderUpdate();
  if (!elements.updatesDialog.hidden) {
    checkForUpdates();
  }
});

elements.search.addEventListener("click", () => runSearch());
elements.cancelSearch.addEventListener("click", () => cancelActiveSearch());
elements.checkUpdate.addEventListener("click", () => checkForUpdates());
elements.installUpdate.addEventListener("click", () => installAvailableUpdate());
elements.openRelease.addEventListener("click", () => openReleasePage());
elements.query.addEventListener("input", () => scheduleSearch());
elements.rootPath.addEventListener("input", () => scheduleSearch());
elements.caseSensitive.addEventListener("change", () => scheduleSearch());
elements.includeHidden.addEventListener("change", () => scheduleSearch());
elements.useRegex.addEventListener("change", () => {
  updateQueryMode();
  scheduleSearch();
});
elements.maxResults.addEventListener("change", () => scheduleSearch());
elements.resultFilter.addEventListener("input", () => applyResultView());
elements.typeFilter.addEventListener("change", () => applyResultView());
elements.sortResults.addEventListener("change", () => applyResultView());

function initLanguageSelect() {
  const saved = localStorage.getItem("filenavigation.language") || "auto";
  const fragment = document.createDocumentFragment();

  for (const [value, label] of languageOptions) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value === "auto" ? `${label} (${resolveLanguage("auto")})` : label;
    fragment.append(option);
  }

  elements.language.replaceChildren(fragment);
  elements.language.value = languageOptions.some(([value]) => value === saved) ? saved : "auto";
}

function resolveLanguage(value) {
  return resolveLocaleLanguage(value, navigator.languages || [navigator.language]);
}

function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

function applyTheme(value, persist = true) {
  currentTheme = normalizeTheme(value);
  document.documentElement.dataset.theme = currentTheme;
  document.querySelector('meta[name="theme-color"]').content = currentTheme === "dark" ? "#171b1a" : "#f4f6f5";
  elements.themeOptions.forEach((option) => {
    option.checked = option.value === currentTheme;
  });

  if (persist) {
    localStorage.setItem("filenavigation.theme", currentTheme);
  }
}

function activateSettingsSection(target, focus = false) {
  elements.settingsNavItems.forEach((item) => {
    const selected = item.dataset.settingsTarget === target;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    if (selected && focus) item.focus();
  });

  elements.settingsSections.forEach((section) => {
    section.hidden = section.dataset.settingsSection !== target;
  });
}

function openDialog(dialog, trigger) {
  if (activeDialog && activeDialog !== dialog) {
    closeDialog(activeDialog, false);
  }

  activeDialog = dialog;
  dialogTrigger = trigger;
  dialog.hidden = false;
  document.body.classList.add("dialog-open");
  window.requestAnimationFrame(() => {
    dialog.classList.add("is-open");
    dialog.querySelector(".dialog-close")?.focus();
  });
}

function closeDialog(dialog, restoreFocus = true) {
  if (!dialog || dialog.hidden) {
    return;
  }

  dialog.classList.remove("is-open");
  dialog.hidden = true;
  if (activeDialog === dialog) {
    activeDialog = null;
    document.body.classList.remove("dialog-open");
    if (restoreFocus) {
      dialogTrigger?.focus();
    }
    dialogTrigger = null;
  }
}

function translate(key, ...args) {
  return translateForLanguage(currentLanguage, key, ...args);
}

function initializeIcons() {
  createIcons({
    icons: uiIcons,
    attrs: {
      width: 18,
      height: 18,
      "stroke-width": 1.8
    }
  });

  document.querySelectorAll('[data-brand-icon="github"]').forEach((container) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    path.setAttribute("d", siGithub.path);
    svg.append(path);
    container.replaceWith(svg);
  });
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = translate(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = translate(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = translate(node.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", translate(node.dataset.i18nAriaLabel));
  });
}

async function initializeProgressListener() {
  await listen("search-progress", (event) => {
    const progress = event.payload;
    if (!progress || progress.search_id !== activeSearchId || !isSearching) {
      return;
    }

    setStatus(
      "searching",
      progress.files_scanned,
      progress.directories_scanned,
      progress.elapsed_ms,
      progress.matches,
      false,
      progress.skipped_entries
    );
    elements.progressDetail.textContent = translate(
      "scanningProgress",
      formatNumber(progress.matches),
      progress.current_path
    );
  });
}

function scheduleSearch() {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => runSearch(), 280);
}

function updateQueryMode() {
  const placeholderKey = elements.useRegex.checked ? "regexPlaceholder" : "queryPlaceholder";
  elements.query.dataset.i18nPlaceholder = placeholderKey;
  elements.query.placeholder = translate(placeholderKey);
}

async function runSearch() {
  const root = elements.rootPath.value.trim();
  const query = elements.query.value.trim();

  if (!root || !query) {
    lastResults = [];
    lastVisibleResults = [];
    setStatus("waiting", 0, 0, 0);
    elements.progressDetail.textContent = translate("progressIdle");
    renderEmpty("emptyTitle", "emptyText");
    return;
  }

  const searchId = createSearchId();
  activeSearchId = searchId;
  isSearching = true;
  elements.search.disabled = true;
  elements.cancelSearch.disabled = false;
  elements.title.textContent = translate("searching");
  elements.progressDetail.textContent = translate("scanningProgress", formatNumber(0), root);
  elements.emptyState.hidden = true;
  elements.resultList.innerHTML = "";

  try {
    const response = await invoke("search_files", {
      request: {
        search_id: searchId,
        root,
        query,
        case_sensitive: elements.caseSensitive.checked,
        use_regex: elements.useRegex.checked,
        include_hidden: elements.includeHidden.checked,
        max_results: Number(elements.maxResults.value || 500)
      }
    });

    if (searchId !== activeSearchId) {
      return;
    }

    lastResults = response.results;
    setStatus(
      response.cancelled ? "searchCancelled" : "found",
      response.stats.files_scanned,
      response.stats.directories_scanned,
      response.stats.elapsed_ms,
      response.results.length,
      response.truncated,
      response.stats.skipped_entries
    );
    elements.progressDetail.textContent = response.cancelled
      ? translate("searchCancelled")
      : translate("visibleResultCount", formatNumber(response.results.length), formatNumber(response.results.length));

    if (response.results.length === 0) {
      renderEmpty("noResultsTitle", "noResultsText");
    } else {
      applyResultView();
    }
  } catch (error) {
    if (searchId === activeSearchId) {
      lastResults = [];
      lastVisibleResults = [];
      setStatus("searchFailed", 0, 0, 0);
      elements.progressDetail.textContent = mapError(error);
      renderEmpty("cannotComplete", mapError(error));
    }
  } finally {
    if (searchId === activeSearchId) {
      isSearching = false;
      elements.search.disabled = false;
      elements.cancelSearch.disabled = true;
    }
  }
}

function createSearchId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function cancelActiveSearch() {
  if (!activeSearchId || !isSearching) {
    return;
  }

  elements.cancelSearch.disabled = true;
  await invoke("cancel_search", { searchId: activeSearchId });
}

async function checkForUpdates() {
  elements.checkUpdate.disabled = true;
  elements.checkUpdate.classList.add("is-busy");
  lastUpdateStatus = "checkingUpdate";
  lastUpdateError = "";
  renderUpdate();

  try {
    lastUpdate = await invoke("check_for_updates", { language: currentLanguage });
    lastUpdateStatus = lastUpdate.has_update ? "updateAvailable" : "upToDate";
  } catch (error) {
    lastUpdate = null;
    lastUpdateStatus = "updateCheckFailed";
    lastUpdateError = mapError(error);
  } finally {
    elements.checkUpdate.disabled = false;
    elements.checkUpdate.classList.remove("is-busy");
    renderUpdate();
  }
}

async function installAvailableUpdate() {
  if (isInstallingUpdate || !lastUpdate?.has_update) {
    return;
  }

  isInstallingUpdate = true;
  elements.installUpdate.disabled = true;
  setUpdateInstallStatus("preparingUpdate", 0);

  try {
    const update = await checkForAppUpdate({ timeout: 30_000 });
    if (!update) {
      throw new Error("updaterUnavailable");
    }

    let downloaded = 0;
    let total = 0;

    await update.downloadAndInstall((event) => {
      if (event.event === "Started") {
        total = Number(event.data.contentLength || 0);
        downloaded = 0;
        setUpdateInstallStatus("updateDownloading", 0);
      } else if (event.event === "Progress") {
        downloaded += Number(event.data.chunkLength || 0);
        const percent = total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;
        setUpdateInstallStatus("updateDownloading", percent);
      } else if (event.event === "Finished") {
        setUpdateInstallStatus("installingUpdate", 100);
      }
    });

    setUpdateInstallStatus("restartingUpdate", 100);
    await relaunch();
  } catch (error) {
    const key = String(error);
    updateInstallError = key === "Error: updaterUnavailable" ? translate("updaterUnavailable") : key;
    setUpdateInstallStatus("automaticUpdateFailed", updateDownloadPercent, updateInstallError);
  } finally {
    isInstallingUpdate = false;
    elements.installUpdate.disabled = false;
  }
}

function setUpdateInstallStatus(key, percent = 0, error = "") {
  updateInstallStatusKey = key;
  updateDownloadPercent = Math.max(0, Math.min(100, percent));
  updateInstallError = error;
  renderUpdateInstallStatus();
}

function renderUpdateInstallStatus() {
  const hasStatus = Boolean(updateInstallStatusKey);
  elements.updateProgress.hidden = !hasStatus;
  elements.updateProgress.classList.toggle("is-indeterminate", hasStatus && updateInstallStatusKey === "preparingUpdate");
  elements.updateProgress.setAttribute("aria-valuenow", String(updateDownloadPercent));
  elements.updateProgressFill.style.width = `${updateDownloadPercent}%`;

  if (!hasStatus) {
    elements.updateInstallStatus.textContent = "";
  } else if (updateInstallStatusKey === "updateDownloading") {
    elements.updateInstallStatus.textContent = translate("updateDownloading", updateDownloadPercent);
  } else if (updateInstallStatusKey === "automaticUpdateFailed" && updateInstallError) {
    elements.updateInstallStatus.textContent = `${translate("automaticUpdateFailed")} ${updateInstallError}`;
  } else {
    elements.updateInstallStatus.textContent = translate(updateInstallStatusKey);
  }
}

function setStatus(statusKey, files, dirs, elapsedMs, count = 0, truncated = false, skipped = 0) {
  lastStatusKey = statusKey;
  lastStatusCount = count;
  lastStatusTruncated = truncated;
  lastStats = { files, dirs, skipped, elapsedMs };

  if (statusKey === "found") {
    elements.title.textContent = translate(truncated ? "foundTruncated" : "found", count);
  } else {
    elements.title.textContent = translate(statusKey);
  }

  elements.statFiles.textContent = formatNumber(files);
  elements.statDirs.textContent = formatNumber(dirs);
  elements.statMs.textContent = `${formatNumber(elapsedMs)} ms`;
  elements.statSkipped.textContent = formatNumber(skipped);
}

function renderEmpty(titleKey, textKey) {
  renderToken += 1;
  elements.emptyState.hidden = false;
  elements.emptyState.querySelector("h3").textContent = translate(titleKey);
  elements.emptyState.querySelector("p").textContent = translate(textKey);
  elements.resultList.innerHTML = "";
}

function applyResultView() {
  if (lastResults.length === 0) {
    return;
  }

  const query = elements.resultFilter.value.trim().toLocaleLowerCase();
  const type = elements.typeFilter.value;
  const sort = elements.sortResults.value;

  lastVisibleResults = lastResults
    .filter((result) => {
      if (type !== "all" && result.kind !== type) {
        return false;
      }

      if (!query) {
        return true;
      }

      return `${result.name}\n${result.path}`.toLocaleLowerCase().includes(query);
    })
    .sort((left, right) => compareResults(left, right, sort));

  if (lastResults.length > 0) {
    elements.progressDetail.textContent = translate(
      "visibleResultCount",
      formatNumber(lastVisibleResults.length),
      formatNumber(lastResults.length)
    );
  }

  if (lastResults.length > 0 && lastVisibleResults.length === 0) {
    renderEmpty("noVisibleResultsTitle", "noVisibleResultsText");
    return;
  }

  renderResults(lastVisibleResults);
}

function compareResults(left, right, sort) {
  if (sort === "name-desc") {
    return right.name.localeCompare(left.name, currentLanguage);
  }

  if (sort === "modified-desc" || sort === "modified-asc") {
    const leftTime = Date.parse(left.modified || "") || 0;
    const rightTime = Date.parse(right.modified || "") || 0;
    return sort === "modified-desc" ? rightTime - leftTime : leftTime - rightTime;
  }

  if (sort === "size-desc" || sort === "size-asc") {
    return sort === "size-desc" ? right.size - left.size : left.size - right.size;
  }

  return left.name.localeCompare(right.name, currentLanguage);
}

function renderResults(results) {
  renderToken += 1;
  const token = renderToken;
  elements.emptyState.hidden = true;
  elements.resultList.innerHTML = "";

  let index = 0;
  const renderChunk = () => {
    if (token !== renderToken) {
      return;
    }

    const fragment = document.createDocumentFragment();
    const end = Math.min(index + 120, results.length);
    for (; index < end; index += 1) {
      fragment.append(createResultRow(results[index]));
    }

    elements.resultList.append(fragment);

    if (index < results.length) {
      window.requestAnimationFrame(renderChunk);
    }
  };

  renderChunk();
}

function createResultRow(result) {
  const row = document.createElement("article");
  row.className = "result-row";

  const icon = document.createElement("div");
  icon.className = `file-icon${result.is_dir ? " directory" : ""}`;
  icon.setAttribute("aria-hidden", "true");
  icon.append(
    createIconElement(result.is_dir ? FolderIcon : FileIcon, {
      width: 19,
      height: 19,
      "stroke-width": 1.8
    })
  );

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
  meta.textContent = `${translate(result.is_dir ? "directory" : "file")} · ${formatBytes(result.size)} · ${
    result.modified ?? translate("unknownTime")
  }`;

  const openIndicator = createIconElement(ArrowUpRight, {
    class: "result-open-icon",
    width: 15,
    height: 15,
    "stroke-width": 1.9,
    "aria-hidden": "true"
  });

  content.append(name, path, meta);
  row.append(icon, content, openIndicator);
  return row;
}

function renderUpdate() {
  if (lastUpdateStatus === "updateAvailable" && lastUpdate) {
    elements.updateStatus.textContent = translate("updateAvailable", `v${lastUpdate.latest_version}`);
  } else if (lastUpdateStatus === "updateCheckFailed") {
    elements.updateStatus.textContent = lastUpdateError || translate("updateCheckFailed");
  } else {
    elements.updateStatus.textContent = translate(lastUpdateStatus);
  }

  elements.openUpdates.classList.toggle("has-update", Boolean(lastUpdate?.has_update));
  elements.automaticUpdate.hidden = !lastUpdate?.has_update;
  renderUpdateInstallStatus();

  elements.updateDetails.hidden = !lastUpdate;
  if (!lastUpdate) {
    return;
  }

  elements.currentVersion.textContent = `v${lastUpdate.current_version}`;
  elements.latestVersion.textContent = `v${lastUpdate.latest_version}`;
  elements.publishedAt.textContent = formatDateTime(lastUpdate.published_at);
  elements.releaseNotes.textContent = lastUpdate.release_notes.trim() || translate("emptyReleaseNotes");
  renderReleaseAssets(lastUpdate.assets || []);
}

function renderReleaseAssets(assets) {
  elements.releaseAssets.innerHTML = "";

  if (assets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "asset-empty";
    empty.textContent = translate("noPackageChecksums");
    elements.releaseAssets.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const asset of assets) {
    const item = document.createElement("article");
    item.className = "asset-row";

    const icon = createIconElement(PackageCheck, {
      width: 16,
      height: 16,
      "stroke-width": 1.8,
      "aria-hidden": "true"
    });

    const name = document.createElement("strong");
    name.textContent = asset.name;

    const meta = document.createElement("span");
    const metadata = [];
    if (asset.size > 0) metadata.push(formatBytes(asset.size));
    if (asset.digest) metadata.push(asset.digest);
    meta.textContent = metadata.join(" · ") || translate("noPackageChecksums");

    item.append(icon, name, meta);
    fragment.append(item);
  }

  elements.releaseAssets.append(fragment);
}

async function openReleasePage() {
  if (!lastUpdate?.release_url) {
    return;
  }

  try {
    await invoke("open_path", { path: lastUpdate.release_url });
  } catch (error) {
    elements.updateStatus.textContent = `${translate("openFailed")}: ${mapError(error)}`;
  }
}

async function openPath(path) {
  try {
    await invoke("open_path", { path });
  } catch (error) {
    elements.title.textContent = `${translate("openFailed")}: ${mapError(error)}`;
  }
}

function mapError(error) {
  const key = String(error);
  const translated = translate(key);
  return translated === key ? key : translated;
}

function formatNumber(value) {
  return new Intl.NumberFormat(currentLanguage).format(value);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(currentLanguage, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${new Intl.NumberFormat(currentLanguage, {
    maximumFractionDigits: value >= 100 || index === 0 ? 0 : 1
  }).format(value)} ${units[index]}`;
}
