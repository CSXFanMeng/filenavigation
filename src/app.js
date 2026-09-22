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
  ChevronRight,
  Copy,
  CopyMinus,
  Database,
  Download,
  ExternalLink,
  File as FileIcon,
  FileCheck2,
  FileInput,
  FileLock2,
  Files,
  FileType,
  Filter,
  Fingerprint,
  Folder as FolderIcon,
  FolderOpen,
  FolderSearch,
  Folders,
  FolderTree,
  GitBranch,
  HardDrive,
  Hash,
  Languages,
  Layers3,
  ListChecks,
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
  ShieldCheck,
  Sun,
  Timer,
  Trash2,
  X,
  createElement as createIconElement,
  createIcons
} from "lucide";
import { languageOptions, resolveLanguage as resolveLocaleLanguage, translateForLanguage } from "./i18n/index.js";
import {
  autoSelectDuplicatePaths,
  buildDuplicateDeleteGroups,
  getDuplicateSelectionStats
} from "./duplicates.js";
import {
  buildResultTree,
  collectExpandableFolderPaths,
  collectFilePaths,
  countVisibleResults,
  filterResultTree,
  flattenResultTree,
  sortResultTree
} from "./result-tree.js";
import "./styles.css";

const uiIcons = {
  ArrowUpDown,
  Check,
  ChevronDown,
  Copy,
  CopyMinus,
  Database,
  Download,
  ExternalLink,
  Files,
  FileCheck2,
  FileInput,
  FileLock2,
  FileType,
  Filter,
  Fingerprint,
  FolderOpen,
  FolderSearch,
  Folders,
  FolderTree,
  GitBranch,
  HardDrive,
  Hash,
  Languages,
  Layers3,
  ListChecks,
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
  ShieldCheck,
  Sun,
  Timer,
  Trash2,
  X
};

const elements = {
  toolButtons: [...document.querySelectorAll("[data-tool-target]")],
  toolPanels: [...document.querySelectorAll("[data-tool-panel]")],
  toolViews: [...document.querySelectorAll("[data-tool-view]")],
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
  integritySource: document.querySelector("#integrity-source"),
  integrityPathField: document.querySelector("#integrity-path-field"),
  integrityPath: document.querySelector("#integrity-path"),
  pickIntegrityTarget: document.querySelector("#pick-integrity-target"),
  integrityAlgorithm: document.querySelector("#integrity-algorithm"),
  integrityExpected: document.querySelector("#integrity-expected"),
  verifyIntegrity: document.querySelector("#verify-integrity"),
  cancelIntegrity: document.querySelector("#cancel-integrity"),
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
  integrityTitle: document.querySelector("#integrity-status-title"),
  integrityStatFiles: document.querySelector("#integrity-stat-files"),
  integrityStatBytes: document.querySelector("#integrity-stat-bytes"),
  integrityStatMs: document.querySelector("#integrity-stat-ms"),
  integrityProgressDetail: document.querySelector("#integrity-progress-detail"),
  integrityMeter: document.querySelector(".integrity-meter"),
  integrityMeterFill: document.querySelector("#integrity-meter-fill"),
  integrityEmptyState: document.querySelector("#integrity-empty-state"),
  integrityResult: document.querySelector("#integrity-result"),
  integrityVerdict: document.querySelector("#integrity-verdict"),
  integrityVerdictTitle: document.querySelector("#integrity-verdict-title"),
  integrityVerdictDetail: document.querySelector("#integrity-verdict-detail"),
  integrityResultAlgorithm: document.querySelector("#integrity-result-algorithm"),
  integrityHash: document.querySelector("#integrity-hash"),
  copyIntegrityHash: document.querySelector("#copy-integrity-hash"),
  integrityCopyFeedback: document.querySelector("#integrity-copy-feedback"),
  integrityResultCount: document.querySelector("#integrity-result-count"),
  integrityFileList: document.querySelector("#integrity-file-list"),
  duplicatesSource: document.querySelector("#duplicates-source"),
  duplicatesPathField: document.querySelector("#duplicates-path-field"),
  duplicatesPath: document.querySelector("#duplicates-path"),
  pickDuplicatesFolder: document.querySelector("#pick-duplicates-folder"),
  scanDuplicates: document.querySelector("#scan-duplicates"),
  cancelDuplicates: document.querySelector("#cancel-duplicates"),
  duplicatesTitle: document.querySelector("#duplicates-status-title"),
  duplicatesStatGroups: document.querySelector("#duplicates-stat-groups"),
  duplicatesStatFiles: document.querySelector("#duplicates-stat-files"),
  duplicatesStatBytes: document.querySelector("#duplicates-stat-bytes"),
  duplicatesProgressDetail: document.querySelector("#duplicates-progress-detail"),
  duplicatesMeter: document.querySelector("#duplicates-meter"),
  duplicatesMeterFill: document.querySelector("#duplicates-meter-fill"),
  duplicatesEmptyState: document.querySelector("#duplicates-empty-state"),
  duplicatesResult: document.querySelector("#duplicates-result"),
  duplicatesSelectionCount: document.querySelector("#duplicates-selection-count"),
  duplicatesSelectionSize: document.querySelector("#duplicates-selection-size"),
  autoSelectDuplicates: document.querySelector("#auto-select-duplicates"),
  trashSelectedDuplicates: document.querySelector("#trash-selected-duplicates"),
  duplicatesGroupList: document.querySelector("#duplicates-group-list"),
  duplicatesConfirmDialog: document.querySelector("#duplicates-confirm-dialog"),
  duplicatesConfirmDetail: document.querySelector("#duplicates-confirm-detail"),
  confirmTrashDuplicates: document.querySelector("#confirm-trash-duplicates"),
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
let integrityRenderToken = 0;
let activeTool = "search";
let activeIntegrityId = "";
let isCheckingIntegrity = false;
let lastIntegrityStatus = "integrityReady";
let lastIntegrityResult = null;
let lastIntegrityError = "";
let lastIntegrityProgress = { bytesRead: 0, totalBytes: 0, filesCompleted: 0, totalFiles: 0, elapsedMs: 0 };
let activeDuplicateId = "";
let isScanningDuplicates = false;
let isDeletingDuplicates = false;
let lastDuplicateStatus = "duplicatesReady";
let lastDuplicateResult = null;
let lastDuplicateError = "";
let lastDuplicateProgress = { stage: "", filesProcessed: 0, totalFiles: 0, bytesRead: 0, totalBytes: 0, elapsedMs: 0, currentPath: "" };
let selectedDuplicatePaths = new Set();
let currentLanguage = resolveLanguage(localStorage.getItem("filenavigation.language") || "auto");
let lastResults = [];
let lastResultTree = [];
let lastVisibleResults = [];
const collapsedPaths = new Set();
let lastStats = { files: 0, dirs: 0, skipped: 0, elapsedMs: 0 };
let lastStatusKey = "waiting";
let lastStatusCount = 0;
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
updateIntegritySource();
renderIntegrity();
updateDuplicateSource();
renderDuplicates();
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

elements.toolButtons.forEach((button, index) => {
  button.addEventListener("click", () => setActiveTool(button.dataset.toolTarget));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const targetIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? elements.toolButtons.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + elements.toolButtons.length)
          % elements.toolButtons.length;
    const target = elements.toolButtons[targetIndex];
    setActiveTool(target.dataset.toolTarget);
    target.focus();
  });
});

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

elements.pickIntegrityTarget.addEventListener("click", async () => {
  const folder = elements.integritySource.value === "folder";
  const selected = await open({
    directory: folder,
    multiple: false,
    title: translate(folder ? "pickIntegrityFolder" : "pickIntegrityFile")
  });

  if (typeof selected === "string") {
    elements.integrityPath.value = selected;
  }
});

elements.pickDuplicatesFolder.addEventListener("click", async () => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: translate("pickDuplicatesFolder")
  });

  if (typeof selected === "string") {
    elements.duplicatesPath.value = selected;
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
  renderIntegrity();
  renderDuplicates();
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
elements.resultFilter.addEventListener("input", () => applyResultView());
elements.typeFilter.addEventListener("change", () => applyResultView());
elements.sortResults.addEventListener("change", () => applyResultView());
elements.integritySource.addEventListener("change", () => updateIntegritySource());
elements.verifyIntegrity.addEventListener("click", () => runIntegrityCheck());
elements.cancelIntegrity.addEventListener("click", () => cancelActiveIntegrityCheck());
elements.copyIntegrityHash.addEventListener("click", () => copyIntegrityFingerprint());
elements.duplicatesSource.addEventListener("change", () => updateDuplicateSource());
elements.scanDuplicates.addEventListener("click", () => runDuplicateScan());
elements.cancelDuplicates.addEventListener("click", () => cancelActiveDuplicateScan());
elements.autoSelectDuplicates.addEventListener("click", () => {
  selectedDuplicatePaths = autoSelectDuplicatePaths(lastDuplicateResult?.groups || []);
  renderDuplicates();
});
elements.trashSelectedDuplicates.addEventListener("click", () => openDuplicateConfirmation());
elements.confirmTrashDuplicates.addEventListener("click", () => deleteSelectedDuplicates());

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

function setActiveTool(target) {
  if (!["search", "integrity", "duplicates"].includes(target)) {
    return;
  }

  activeTool = target;
  window.clearTimeout(debounceTimer);
  elements.toolButtons.forEach((button) => {
    const selected = button.dataset.toolTarget === target;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  elements.toolPanels.forEach((panel) => {
    panel.hidden = panel.dataset.toolPanel !== target;
  });
  elements.toolViews.forEach((view) => {
    view.hidden = view.dataset.toolView !== target;
  });

  if (target === "integrity") {
    if (elements.integritySource.value === "folder" && !elements.integrityPath.value.trim()) {
      elements.integrityPath.value = elements.rootPath.value.trim();
    }
    updateIntegritySource();
  }
  if (target === "duplicates") {
    if (elements.duplicatesSource.value === "folder" && !elements.duplicatesPath.value.trim()) {
      elements.duplicatesPath.value = elements.rootPath.value.trim();
    }
    updateDuplicateSource();
  }
}

function updateIntegritySource() {
  const source = elements.integritySource.value;
  elements.integrityPathField.hidden = source === "filtered" || source === "current";
  if (source === "folder" && !elements.integrityPath.value.trim()) {
    elements.integrityPath.value = elements.rootPath.value.trim();
  }
}

function updateDuplicateSource() {
  const source = elements.duplicatesSource.value;
  elements.duplicatesPathField.hidden = source !== "folder";
  if (source === "folder" && !elements.duplicatesPath.value.trim()) {
    elements.duplicatesPath.value = elements.rootPath.value.trim();
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
      progress.skipped_entries
    );
    elements.progressDetail.textContent = translate(
      "scanningProgress",
      formatNumber(progress.matches),
      progress.current_path
    );
  });

  await listen("integrity-progress", (event) => {
    const progress = event.payload;
    if (!progress || progress.operation_id !== activeIntegrityId || !isCheckingIntegrity) {
      return;
    }

    lastIntegrityProgress = {
      bytesRead: Number(progress.bytes_read || 0),
      totalBytes: Number(progress.total_bytes || 0),
      filesCompleted: Number(progress.files_completed || 0),
      totalFiles: Number(progress.total_files || 0),
      elapsedMs: Number(progress.elapsed_ms || 0),
      currentPath: progress.current_path || ""
    };
    lastIntegrityStatus = "integrityReading";
    renderIntegrity();
  });

  await listen("duplicate-progress", (event) => {
    const progress = event.payload;
    if (!progress || progress.operation_id !== activeDuplicateId || !isScanningDuplicates) {
      return;
    }

    lastDuplicateProgress = {
      stage: progress.stage || "hashing",
      filesProcessed: Number(progress.files_processed || 0),
      totalFiles: Number(progress.total_files || 0),
      bytesRead: Number(progress.bytes_read || 0),
      totalBytes: Number(progress.total_bytes || 0),
      elapsedMs: Number(progress.elapsed_ms || 0),
      currentPath: progress.current_path || ""
    };
    lastDuplicateStatus = "duplicatesScanning";
    renderDuplicates();
  });
}

function scheduleSearch() {
  if (activeTool !== "search") {
    return;
  }
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

  if (!root) {
    lastResults = [];
    lastResultTree = [];
    lastVisibleResults = [];
    collapsedPaths.clear();
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
        include_hidden: elements.includeHidden.checked
      }
    });

    if (searchId !== activeSearchId) {
      return;
    }

    lastResults = response.results;
    lastResultTree = buildResultTree(response.results, root);
    collapsedPaths.clear();
    collectExpandableFolderPaths(lastResultTree).forEach((path) => collapsedPaths.add(path));
    setStatus(
      response.cancelled ? "searchCancelled" : "found",
      response.stats.files_scanned,
      response.stats.directories_scanned,
      response.stats.elapsed_ms,
      response.results.length,
      response.stats.skipped_entries
    );
    elements.progressDetail.textContent = response.cancelled
      ? translate("searchCancelled")
      : translate("visibleResultCount", formatNumber(response.results.length), formatNumber(response.results.length));

    if (response.results.length === 0) {
      renderEmpty(query ? "noResultsTitle" : "emptyFolderTitle", query ? "noResultsText" : "emptyFolderText");
    } else {
      applyResultView();
    }
  } catch (error) {
    if (searchId === activeSearchId) {
      lastResults = [];
      lastResultTree = [];
      lastVisibleResults = [];
      collapsedPaths.clear();
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

async function runIntegrityCheck() {
  if (isCheckingIntegrity) {
    return;
  }

  const source = elements.integritySource.value;
  const path = source === "current" ? elements.rootPath.value.trim() : elements.integrityPath.value.trim();
  const paths = source === "filtered" ? collectFilePaths(lastVisibleResults) : [];
  if (source === "filtered" && paths.length === 0) {
    lastIntegrityStatus = "integrityFailed";
    lastIntegrityError = translate("noFilteredFiles");
    lastIntegrityResult = null;
    renderIntegrity();
    return;
  }
  if (source !== "filtered" && !path) {
    lastIntegrityStatus = "integrityFailed";
    lastIntegrityError = translate(
      source === "folder" || source === "current" ? "invalidDirectory" : "invalidFile"
    );
    lastIntegrityResult = null;
    renderIntegrity();
    return;
  }

  const operationId = createSearchId();
  activeIntegrityId = operationId;
  isCheckingIntegrity = true;
  lastIntegrityStatus = "integrityReading";
  lastIntegrityResult = null;
  lastIntegrityError = "";
  lastIntegrityProgress = {
    bytesRead: 0,
    totalBytes: 0,
    filesCompleted: 0,
    totalFiles: paths.length,
    elapsedMs: 0,
    currentPath: path
  };
  setIntegrityControlsDisabled(true);
  renderIntegrity();

  try {
    const response = await invoke("verify_file_integrity", {
      request: {
        operation_id: operationId,
        source: source === "current" ? "folder" : source,
        path: source === "filtered" ? elements.rootPath.value.trim() : path,
        paths,
        root: elements.rootPath.value.trim() || null,
        algorithm: elements.integrityAlgorithm.value,
        expected_hash: elements.integrityExpected.value || null
      }
    });

    if (operationId !== activeIntegrityId) {
      return;
    }

    lastIntegrityResult = response;
    lastIntegrityProgress = {
      bytesRead: Number(response.bytes_read || 0),
      totalBytes: Number(response.total_bytes || 0),
      filesCompleted: response.files.length,
      totalFiles: Number(response.total_files || response.files.length),
      elapsedMs: Number(response.elapsed_ms || 0),
      currentPath: ""
    };
    lastIntegrityStatus = response.cancelled ? "integrityCancelled" : "integrityComplete";
  } catch (error) {
    if (operationId === activeIntegrityId) {
      lastIntegrityResult = null;
      lastIntegrityStatus = "integrityFailed";
      lastIntegrityError = mapError(error);
    }
  } finally {
    if (operationId === activeIntegrityId) {
      isCheckingIntegrity = false;
      setIntegrityControlsDisabled(false);
      renderIntegrity();
    }
  }
}

async function cancelActiveIntegrityCheck() {
  if (!activeIntegrityId || !isCheckingIntegrity) {
    return;
  }

  elements.cancelIntegrity.disabled = true;
  await invoke("cancel_integrity_check", { operationId: activeIntegrityId });
}

function setIntegrityControlsDisabled(disabled) {
  elements.integritySource.disabled = disabled;
  elements.integrityPath.disabled = disabled;
  elements.pickIntegrityTarget.disabled = disabled;
  elements.integrityAlgorithm.disabled = disabled;
  elements.integrityExpected.disabled = disabled;
  elements.verifyIntegrity.disabled = disabled;
  elements.cancelIntegrity.disabled = !disabled;
}

function renderIntegrity() {
  const progress = lastIntegrityProgress;
  const completed = lastIntegrityResult?.files?.length ?? progress.filesCompleted;
  elements.integrityTitle.textContent = translate(lastIntegrityStatus);
  elements.integrityStatFiles.textContent = progress.totalFiles
    ? `${formatNumber(completed)}/${formatNumber(progress.totalFiles)}`
    : formatNumber(completed);
  elements.integrityStatBytes.textContent = formatBytes(progress.bytesRead);
  elements.integrityStatMs.textContent = `${formatNumber(progress.elapsedMs)} ms`;

  const percentage = progress.totalBytes > 0
    ? Math.min(100, Math.round((progress.bytesRead / progress.totalBytes) * 100))
    : lastIntegrityStatus === "integrityComplete" ? 100 : 0;
  elements.integrityMeterFill.style.width = `${percentage}%`;
  elements.integrityMeter.setAttribute("aria-valuenow", String(percentage));

  if (lastIntegrityStatus === "integrityReading") {
    const fileProgress = progress.totalFiles
      ? `${formatNumber(progress.filesCompleted)}/${formatNumber(progress.totalFiles)}`
      : formatNumber(progress.filesCompleted);
    elements.integrityProgressDetail.textContent =
      `${translate("integrityReading")} · ${fileProgress} · ${formatBytes(progress.bytesRead)} / ${formatBytes(progress.totalBytes)}`;
  } else if (lastIntegrityStatus === "integrityComplete") {
    elements.integrityProgressDetail.textContent = translate("integrityCompleteDetail");
  } else if (lastIntegrityStatus === "integrityFailed") {
    elements.integrityProgressDetail.textContent = lastIntegrityError || translate("integrityTaskFailed");
  } else {
    elements.integrityProgressDetail.textContent = translate(
      lastIntegrityStatus === "integrityCancelled" ? "integrityCancelledDetail" : "integrityProgressIdle"
    );
  }

  const showResult = lastIntegrityStatus === "integrityComplete" && lastIntegrityResult;
  elements.integrityEmptyState.hidden = Boolean(showResult);
  elements.integrityResult.hidden = !showResult;
  if (!showResult) {
    const headingKey = lastIntegrityStatus === "integrityFailed"
      ? "integrityFailed"
      : lastIntegrityStatus === "integrityCancelled"
        ? "integrityCancelled"
        : lastIntegrityStatus === "integrityReading"
          ? "integrityReading"
          : "integrityEmptyTitle";
    const detail = lastIntegrityStatus === "integrityFailed"
      ? lastIntegrityError
      : lastIntegrityStatus === "integrityCancelled"
        ? translate("integrityCancelledDetail")
        : lastIntegrityStatus === "integrityReading"
          ? progress.currentPath || translate("integrityReading")
          : translate("integrityEmptyText");
    elements.integrityEmptyState.querySelector("h3").textContent = translate(headingKey);
    elements.integrityEmptyState.querySelector("p").textContent = detail;
    return;
  }

  renderIntegrityResult(lastIntegrityResult);
}

function renderIntegrityResult(result) {
  const hasExpected = Boolean(result.expected_hash);
  const mismatch = hasExpected && result.matches === false;
  elements.integrityVerdict.classList.toggle("is-mismatch", mismatch);
  elements.integrityVerdictTitle.textContent = hasExpected
    ? translate(result.matches ? "integrityMatchTitle" : "integrityMismatchTitle")
    : translate("integrityCompleteTitle");
  elements.integrityVerdictDetail.textContent = hasExpected
    ? translate(result.matches ? "integrityMatchText" : "integrityMismatchText")
    : translate("integrityCompleteText");
  elements.integrityResultAlgorithm.textContent = result.algorithm.toUpperCase().replace("SHA", "SHA-");
  elements.integrityHash.textContent = result.aggregate_hash;
  elements.integrityResultCount.textContent = formatNumber(result.files.length);
  elements.integrityCopyFeedback.textContent = "";
  renderIntegrityFiles(result.files);
}

function renderIntegrityFiles(files) {
  integrityRenderToken += 1;
  const token = integrityRenderToken;
  elements.integrityFileList.replaceChildren();
  let index = 0;

  const renderChunk = () => {
    if (token !== integrityRenderToken) {
      return;
    }
    const fragment = document.createDocumentFragment();
    const end = Math.min(index + 100, files.length);
    for (; index < end; index += 1) {
      const file = files[index];
      const row = document.createElement("article");
      row.className = "integrity-file-row";
      const path = document.createElement("span");
      path.className = "integrity-file-path";
      path.textContent = file.relative_path || file.path;
      path.title = file.path;
      const size = document.createElement("span");
      size.className = "integrity-file-size";
      size.textContent = formatBytes(file.size);
      const hash = document.createElement("code");
      hash.className = "integrity-file-hash";
      hash.textContent = file.hash;
      row.append(path, size, hash);
      fragment.append(row);
    }
    elements.integrityFileList.append(fragment);
    if (index < files.length) {
      window.requestAnimationFrame(renderChunk);
    }
  };
  renderChunk();
}

async function copyIntegrityFingerprint() {
  const value = lastIntegrityResult?.aggregate_hash;
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    elements.integrityCopyFeedback.textContent = translate("fingerprintCopied");
  } catch {
    elements.integrityCopyFeedback.textContent = translate("copyFailed");
  }
}

async function runDuplicateScan() {
  if (isScanningDuplicates || isDeletingDuplicates) return;

  const source = elements.duplicatesSource.value;
  const path = source === "current" ? elements.rootPath.value.trim() : elements.duplicatesPath.value.trim();
  const paths = source === "filtered" ? collectFilePaths(lastVisibleResults) : [];
  if (source === "filtered" && paths.length === 0) {
    lastDuplicateStatus = "duplicatesFailed";
    lastDuplicateError = translate("noFilteredFiles");
    lastDuplicateResult = null;
    renderDuplicates();
    return;
  }
  if (source !== "filtered" && !path) {
    lastDuplicateStatus = "duplicatesFailed";
    lastDuplicateError = translate("invalidDirectory");
    lastDuplicateResult = null;
    renderDuplicates();
    return;
  }

  const operationId = createSearchId();
  activeDuplicateId = operationId;
  isScanningDuplicates = true;
  lastDuplicateStatus = "duplicatesScanning";
  lastDuplicateError = "";
  lastDuplicateResult = null;
  selectedDuplicatePaths = new Set();
  lastDuplicateProgress = {
    stage: "indexing",
    filesProcessed: 0,
    totalFiles: paths.length,
    bytesRead: 0,
    totalBytes: 0,
    elapsedMs: 0,
    currentPath: path
  };
  setDuplicateControlsDisabled(true);
  renderDuplicates();

  try {
    const response = await invoke("find_duplicate_files", {
      request: {
        operation_id: operationId,
        source: source === "current" ? "folder" : source,
        path: source === "filtered" ? elements.rootPath.value.trim() : path,
        paths,
        root: elements.rootPath.value.trim() || null
      }
    });
    if (operationId !== activeDuplicateId) return;

    lastDuplicateResult = response;
    lastDuplicateProgress = {
      stage: "complete",
      filesProcessed: Number(response.total_files || 0),
      totalFiles: Number(response.total_files || 0),
      bytesRead: Number(response.bytes_read || 0),
      totalBytes: Number(response.bytes_read || 0),
      elapsedMs: Number(response.elapsed_ms || 0),
      currentPath: ""
    };
    lastDuplicateStatus = response.cancelled
      ? "duplicatesCancelled"
      : response.groups.length > 0 ? "duplicatesComplete" : "duplicatesNoMatches";
  } catch (error) {
    if (operationId === activeDuplicateId) {
      lastDuplicateStatus = String(error) === "duplicateCancelled" ? "duplicatesCancelled" : "duplicatesFailed";
      lastDuplicateError = mapError(error);
      lastDuplicateResult = null;
    }
  } finally {
    if (operationId === activeDuplicateId) {
      isScanningDuplicates = false;
      setDuplicateControlsDisabled(false);
      renderDuplicates();
    }
  }
}

async function cancelActiveDuplicateScan() {
  if (!activeDuplicateId || !isScanningDuplicates) return;
  elements.cancelDuplicates.disabled = true;
  await invoke("cancel_duplicate_scan", { operationId: activeDuplicateId });
}

function setDuplicateControlsDisabled(disabled) {
  elements.duplicatesSource.disabled = disabled;
  elements.duplicatesPath.disabled = disabled;
  elements.pickDuplicatesFolder.disabled = disabled;
  elements.scanDuplicates.disabled = disabled;
  elements.cancelDuplicates.disabled = !disabled;
}

function renderDuplicates() {
  const result = lastDuplicateResult;
  const progress = lastDuplicateProgress;
  elements.duplicatesTitle.textContent = translate(lastDuplicateStatus);
  elements.duplicatesStatGroups.textContent = formatNumber(result?.groups?.length || 0);
  elements.duplicatesStatFiles.textContent = formatNumber(result?.duplicate_files || 0);
  elements.duplicatesStatBytes.textContent = formatBytes(result?.reclaimable_bytes || 0);

  const percentage = progress.totalBytes > 0
    ? Math.min(100, Math.round((progress.bytesRead / progress.totalBytes) * 100))
    : ["duplicatesComplete", "duplicatesNoMatches", "duplicatesDeleteComplete", "duplicatesDeletePartial"].includes(lastDuplicateStatus) ? 100 : 0;
  elements.duplicatesMeterFill.style.width = `${percentage}%`;
  elements.duplicatesMeter.setAttribute("aria-valuenow", String(percentage));

  if (lastDuplicateStatus === "duplicatesScanning") {
    const count = progress.totalFiles
      ? `${formatNumber(progress.filesProcessed)}/${formatNumber(progress.totalFiles)}`
      : formatNumber(progress.filesProcessed);
    const activity = translate(progress.stage === "indexing" ? "duplicatesScanning" : "duplicatesHashing");
    elements.duplicatesProgressDetail.textContent = progress.stage === "indexing"
      ? `${activity} · ${count}`
      : `${activity} · ${count} · ${formatBytes(progress.bytesRead)} / ${formatBytes(progress.totalBytes)}`;
  } else if (lastDuplicateStatus === "duplicatesFailed") {
    elements.duplicatesProgressDetail.textContent = lastDuplicateError || translate("duplicateTaskFailed");
  } else if (lastDuplicateStatus === "duplicatesCancelled") {
    elements.duplicatesProgressDetail.textContent = translate("duplicatesCancelledDetail");
  } else if (lastDuplicateStatus === "duplicatesDeleteComplete") {
    elements.duplicatesProgressDetail.textContent = lastDuplicateError || translate("duplicatesDeleteCompleteDetail");
  } else if (lastDuplicateStatus === "duplicatesDeletePartial") {
    elements.duplicatesProgressDetail.textContent = lastDuplicateError;
  } else if (lastDuplicateStatus === "duplicatesComplete") {
    elements.duplicatesProgressDetail.textContent = translate(
      "duplicatesCompleteDetail",
      formatNumber(result?.groups?.length || 0),
      formatBytes(result?.reclaimable_bytes || 0)
    );
  } else if (lastDuplicateStatus === "duplicatesNoMatches") {
    elements.duplicatesProgressDetail.textContent = translate("duplicatesNoMatchesDetail");
  } else {
    elements.duplicatesProgressDetail.textContent = translate("duplicatesProgressIdle");
  }

  const showResult = Boolean(result?.groups?.length);
  elements.duplicatesEmptyState.hidden = showResult;
  elements.duplicatesResult.hidden = !showResult;
  if (!showResult) {
    const headingKey = lastDuplicateStatus === "duplicatesDeleteComplete"
      ? "duplicatesDeleteComplete"
      : lastDuplicateStatus === "duplicatesFailed"
      ? "duplicatesFailed"
      : lastDuplicateStatus === "duplicatesCancelled"
        ? "duplicatesCancelled"
        : lastDuplicateStatus === "duplicatesScanning"
          ? "duplicatesScanning"
          : lastDuplicateStatus === "duplicatesNoMatches"
            ? "duplicatesNoMatches"
            : "duplicatesEmptyTitle";
    const detail = lastDuplicateStatus === "duplicatesDeleteComplete"
      ? lastDuplicateError || translate("duplicatesDeleteCompleteDetail")
      : lastDuplicateStatus === "duplicatesFailed"
      ? lastDuplicateError
      : lastDuplicateStatus === "duplicatesScanning"
        ? progress.currentPath || translate("duplicatesHashing")
        : lastDuplicateStatus === "duplicatesCancelled"
          ? translate("duplicatesCancelledDetail")
          : lastDuplicateStatus === "duplicatesNoMatches"
            ? translate("duplicatesNoMatchesDetail")
            : translate("duplicatesEmptyText");
    elements.duplicatesEmptyState.querySelector("h3").textContent = translate(headingKey);
    elements.duplicatesEmptyState.querySelector("p").textContent = detail;
    return;
  }

  const selection = getDuplicateSelectionStats(result.groups, selectedDuplicatePaths);
  elements.duplicatesSelectionCount.textContent = formatNumber(selection.count);
  elements.duplicatesSelectionSize.textContent = formatBytes(selection.bytes);
  elements.trashSelectedDuplicates.disabled = selection.count === 0 || isDeletingDuplicates;
  elements.autoSelectDuplicates.disabled = isDeletingDuplicates;
  renderDuplicateGroups(result.groups);
}

function renderDuplicateGroups(groups) {
  const fragment = document.createDocumentFragment();
  elements.duplicatesGroupList.replaceChildren();

  groups.forEach((group, groupIndex) => {
    const selectedInGroup = group.files.filter((file) => selectedDuplicatePaths.has(file.path));
    const keepFile = group.files.find((file) => !selectedDuplicatePaths.has(file.path));
    const article = document.createElement("article");
    article.className = "duplicate-group";

    const header = document.createElement("header");
    header.className = "duplicate-group-header";
    const heading = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = translate("duplicateGroupTitle", groupIndex + 1);
    const hash = document.createElement("code");
    hash.textContent = group.hash.slice(0, 16);
    heading.append(title, hash);
    const meta = document.createElement("span");
    meta.textContent = `${formatNumber(group.files.length)} · ${formatBytes(group.size)}`;
    header.append(heading, meta);
    article.append(header);

    group.files.forEach((file) => {
      const row = document.createElement("div");
      row.className = "duplicate-file-row";
      const selector = document.createElement("label");
      selector.className = "duplicate-file-select";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedDuplicatePaths.has(file.path);
      checkbox.disabled = isDeletingDuplicates;
      const control = document.createElement("span");
      control.className = "check-control";
      control.setAttribute("aria-hidden", "true");
      control.append(createIconElement(Check, { width: 13, height: 13, "stroke-width": 2.2 }));
      selector.append(checkbox, control);

      const details = document.createElement("div");
      details.className = "duplicate-file-details";
      const path = document.createElement("strong");
      path.textContent = file.relative_path || file.path;
      path.title = file.path;
      const info = document.createElement("span");
      info.textContent = `${formatBytes(file.size)} · ${formatDateTime(file.modified_ms)}`;
      details.append(path, info);

      const actions = document.createElement("div");
      actions.className = "duplicate-file-actions";
      if (keepFile?.path === file.path) {
        const badge = document.createElement("span");
        badge.className = "keep-badge";
        badge.textContent = translate("keptCopy");
        actions.append(badge);
      }
      const openButton = document.createElement("button");
      openButton.className = "row-action";
      openButton.type = "button";
      openButton.title = translate("openItem");
      openButton.setAttribute("aria-label", translate("openItem"));
      openButton.append(createIconElement(ExternalLink, { width: 15, height: 15, "stroke-width": 1.8 }));
      openButton.addEventListener("click", () => openPath(file.path));
      actions.append(openButton);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked && selectedInGroup.length >= group.files.length - 1) {
          checkbox.checked = false;
          elements.duplicatesProgressDetail.textContent = translate("duplicateKeepRequired");
          return;
        }
        if (checkbox.checked) selectedDuplicatePaths.add(file.path);
        else selectedDuplicatePaths.delete(file.path);
        renderDuplicates();
      });

      row.append(selector, details, actions);
      article.append(row);
    });
    fragment.append(article);
  });
  elements.duplicatesGroupList.append(fragment);
}

function openDuplicateConfirmation() {
  const selection = getDuplicateSelectionStats(lastDuplicateResult?.groups || [], selectedDuplicatePaths);
  if (selection.count === 0) return;
  elements.duplicatesConfirmDetail.textContent = translate(
    "duplicatesConfirmDetail",
    formatNumber(selection.count),
    formatBytes(selection.bytes)
  );
  openDialog(elements.duplicatesConfirmDialog, elements.trashSelectedDuplicates);
}

async function deleteSelectedDuplicates() {
  if (isDeletingDuplicates || !lastDuplicateResult) return;

  let groups;
  try {
    groups = buildDuplicateDeleteGroups(lastDuplicateResult.groups, selectedDuplicatePaths);
  } catch (error) {
    lastDuplicateError = mapError(error.message);
    closeDialog(elements.duplicatesConfirmDialog);
    renderDuplicates();
    return;
  }
  if (groups.length === 0) return;

  isDeletingDuplicates = true;
  elements.confirmTrashDuplicates.disabled = true;
  closeDialog(elements.duplicatesConfirmDialog, false);
  renderDuplicates();

  try {
    const response = await invoke("move_duplicate_files_to_trash", { request: { groups } });
    const deleted = new Set(response.deleted_paths || []);
    const failed = response.failed_paths || [];
    selectedDuplicatePaths = new Set(failed);
    lastDuplicateResult.groups = lastDuplicateResult.groups
      .map((group) => ({ ...group, files: group.files.filter((file) => !deleted.has(file.path)) }))
      .filter((group) => group.files.length > 1)
      .map((group) => ({ ...group, reclaimable_bytes: group.size * (group.files.length - 1) }));
    lastDuplicateResult.duplicate_files = lastDuplicateResult.groups
      .reduce((total, group) => total + group.files.length - 1, 0);
    lastDuplicateResult.reclaimable_bytes = lastDuplicateResult.groups
      .reduce((total, group) => total + group.reclaimable_bytes, 0);
    lastDuplicateResult.total_files = Math.max(0, Number(lastDuplicateResult.total_files || 0) - deleted.size);
    lastDuplicateStatus = failed.length ? "duplicatesDeletePartial" : "duplicatesDeleteComplete";
    lastDuplicateError = failed.length
      ? translate("duplicatesDeletePartialDetail", formatNumber(deleted.size), formatNumber(failed.length))
      : translate("duplicatesDeletedDetail", formatNumber(deleted.size), formatBytes(response.reclaimed_bytes || 0));
  } catch (error) {
    lastDuplicateStatus = "duplicatesFailed";
    lastDuplicateError = mapError(error);
  } finally {
    isDeletingDuplicates = false;
    elements.confirmTrashDuplicates.disabled = false;
    renderDuplicates();
  }
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

function setStatus(statusKey, files, dirs, elapsedMs, count = 0, skipped = 0) {
  lastStatusKey = statusKey;
  lastStatusCount = count;
  lastStats = { files, dirs, skipped, elapsedMs };

  if (statusKey === "found") {
    elements.title.textContent = translate("found", count);
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

  lastVisibleResults = sortResultTree(filterResultTree(lastResultTree, query, type), sort, currentLanguage);
  const visibleCount = countVisibleResults(lastVisibleResults);
  const totalCount = lastResults.length;

  if (lastResults.length > 0) {
    elements.progressDetail.textContent = translate(
      "visibleResultCount",
      formatNumber(visibleCount),
      formatNumber(totalCount)
    );
  }

  if (lastResults.length > 0 && visibleCount === 0) {
    renderEmpty("noVisibleResultsTitle", "noVisibleResultsText");
    return;
  }

  renderResults(lastVisibleResults);
}

function renderResults(tree) {
  renderToken += 1;
  const token = renderToken;
  elements.emptyState.hidden = true;
  elements.resultList.innerHTML = "";
  const results = flattenResultTree(tree, collapsedPaths);

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
  row.style.setProperty("--tree-indent", `${Math.min(result.depth, 12) * 18}px`);
  row.title = result.path;

  const hasChildren = result.is_dir && result.children.length > 0;
  const treeControl = document.createElement(hasChildren ? "button" : "span");
  treeControl.className = hasChildren ? "tree-toggle" : "tree-toggle-placeholder";
  if (hasChildren) {
    treeControl.type = "button";
    treeControl.setAttribute("aria-expanded", String(!result.collapsed));
    treeControl.setAttribute("aria-label", `${translate(result.collapsed ? "expandFolder" : "collapseFolder")}: ${result.name}`);
    treeControl.append(
      createIconElement(result.collapsed ? ChevronRight : ChevronDown, {
        width: 16,
        height: 16,
        "stroke-width": 2
      })
    );
    treeControl.addEventListener("click", () => {
      if (result.collapsed) {
        collapsedPaths.delete(result.relative_path);
      } else {
        collapsedPaths.add(result.relative_path);
      }
      renderResults(lastVisibleResults);
    });
  }

  const icon = document.createElement("div");
  icon.className = `file-icon${result.is_dir ? " directory" : ""}`;
  icon.setAttribute("aria-hidden", "true");
  icon.append(
    createIconElement(
      result.is_dir && hasChildren && !result.collapsed ? FolderOpen : result.is_dir ? FolderIcon : FileIcon,
      {
        width: 19,
        height: 19,
        "stroke-width": 1.8
      }
    )
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
  path.textContent = result.relative_path;

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
  row.append(treeControl, icon, content, openIndicator);
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
