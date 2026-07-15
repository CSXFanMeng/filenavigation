# FileNavigation

Languages: [English](#english) | [简体中文](#简体中文) | [繁體中文](#繁體中文)

## English

FileNavigation is a Rust + Tauri desktop app for searching files inside a selected local folder. Search runs on the local machine; file names, paths, and file content are not uploaded.

### Features

- Local file and folder search under a chosen directory
- Async Rust/Tauri backend with cancellable searches and live progress events
- Result filtering, file/folder type filtering, sorting, and progressive rendering for large result sets
- Modern responsive workspace with Lucide icons, polished interaction states, and accessible focus feedback
- Multilingual UI with locale files under `src/i18n/locales`
- Update checker based on the latest GitHub Release
- Localized release notes: the app requests the current UI language and extracts that language block from the Release body
- Package digest display for manual installer integrity checks
- Responsive layout for compact, tablet, and wide desktop screens
- Windows `.exe`/`.msi`, macOS `.dmg`/`.app`, Linux `.deb`/`.rpm`/`.AppImage`

### Development

```bash
npm install
npm run tauri:dev
```

If PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

### Build

```bash
npm run tauri:build
```

Build output is under `src-tauri/target/release/bundle/`.

### Multilingual Release Notes

Release notes are maintained in [RELEASE_NOTES.md](./RELEASE_NOTES.md) with explicit language blocks:

```md
<!-- lang:en -->
English changelog.
<!-- /lang -->

<!-- lang:zh-CN -->
简体中文更新日志。
<!-- /lang -->
```

The app sends the current UI language to the Rust update checker. The checker reads the latest GitHub Release body, extracts the matching language block, falls back to English, then falls back to the raw Release body.

### License

This project uses the [FileNavigation Non-Commercial Source License](./LICENSE.md). Commercial use, resale, SaaS hosting, paid managed services, closed-source commercial integration, and commercial product bundling are prohibited.

## 简体中文

FileNavigation 是一个使用 Rust + Tauri 编写的桌面应用，用于在指定本地目录中查找文件。搜索在本机执行，不上传文件名、路径或文件内容。

### 功能

- 在指定目录下搜索文件和目录
- Rust/Tauri 异步后端，支持取消搜索和实时进度事件
- 结果内过滤、文件/目录类型过滤、排序，以及大量结果的渐进式渲染
- 现代化响应式工作区，使用 Lucide 图标，并完善悬停、加载和无障碍焦点状态
- 多语言 UI，语言文件位于 `src/i18n/locales`
- 基于 GitHub 最新 Release 的更新检查
- 本地化更新日志：软件会传入当前 UI 语言，并从 Release 正文中截取对应语言块
- 显示安装包 digest，方便手动校验完整性
- 适配窄屏、平板和宽屏桌面布局
- Windows `.exe`/`.msi`，macOS `.dmg`/`.app`，Linux `.deb`/`.rpm`/`.AppImage`

### 本地开发

```bash
npm install
npm run tauri:dev
```

如果 PowerShell 阻止 `npm.ps1`，使用：

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

### 构建

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`。

### 多语言 Release Notes

发布说明维护在 [RELEASE_NOTES.md](./RELEASE_NOTES.md)，使用明确的语言块：

```md
<!-- lang:en -->
English changelog.
<!-- /lang -->

<!-- lang:zh-CN -->
简体中文更新日志。
<!-- /lang -->
```

软件更新检查会把当前 UI 语言传给 Rust 后端。后端读取 GitHub 最新 Release 正文，优先截取匹配语言块，然后回退英文，最后回退完整 Release 正文。

### 许可证

本项目使用 [FileNavigation Non-Commercial Source License](./LICENSE.md)。禁止商业使用、转售、SaaS 托管、收费托管服务、闭源商业集成和作为商业产品的一部分捆绑分发。

## 繁體中文

FileNavigation 是一個使用 Rust + Tauri 編寫的桌面應用，用於在指定本機目錄中查找檔案。搜尋在本機執行，不會上傳檔名、路徑或檔案內容。

### 功能

- 在指定目錄下搜尋檔案和目錄
- Rust/Tauri 非同步後端，支援取消搜尋和即時進度事件
- 結果內過濾、檔案/目錄類型過濾、排序，以及大量結果的漸進式渲染
- 現代化響應式工作區，使用 Lucide 圖示，並完善懸停、載入和無障礙焦點狀態
- 多語言 UI，語言檔案位於 `src/i18n/locales`
- 基於 GitHub 最新 Release 的更新檢查
- 本地化更新日誌：軟體會傳入目前 UI 語言，並從 Release 正文中擷取對應語言區塊
- 顯示安裝包 digest，方便手動校驗完整性
- 適配窄螢幕、平板和寬螢幕桌面布局
- Windows `.exe`/`.msi`，macOS `.dmg`/`.app`，Linux `.deb`/`.rpm`/`.AppImage`

### 本機開發

```bash
npm install
npm run tauri:dev
```

如果 PowerShell 阻止 `npm.ps1`，使用：

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

### 建置

```bash
npm run tauri:build
```

建置產物位於 `src-tauri/target/release/bundle/`。

### 多語言 Release Notes

發布說明維護在 [RELEASE_NOTES.md](./RELEASE_NOTES.md)，使用明確的語言區塊。軟體更新檢查會把目前 UI 語言傳給 Rust 後端，後端會優先擷取匹配語言，然後回退英文，最後回退完整 Release 正文。

### 授權

本專案使用 [FileNavigation Non-Commercial Source License](./LICENSE.md)。禁止商業使用、轉售、SaaS 託管、收費託管服務、閉源商業整合和作為商業產品的一部分捆綁分發。
