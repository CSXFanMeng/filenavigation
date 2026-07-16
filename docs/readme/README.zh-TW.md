# FileNavigation

[全部語言](../../README.md) · [最新版本](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation 是一個使用 Rust + Tauri 編寫的桌面應用程式，用於在指定本機目錄中尋找檔案和資料夾。搜尋完全在本機執行，不會上傳檔名、路徑或檔案內容。

## 功能

- 在指定目錄下搜尋本機檔案和資料夾
- 全非同步 Rust/Tauri 後端，支援取消搜尋和即時進度
- 結果篩選、類型篩選、排序及大量結果漸進式渲染
- 使用 Lucide 圖示的現代化響應式介面，並提供無障礙焦點狀態
- 應用程式自行繪製無邊框視窗，提供可拖曳的多語言視窗控制
- 主工作區固定在視窗內，結果清單獨立捲動
- 20 種語言介面，翻譯保存在獨立語言檔案中
- 根據 GitHub 最新 Release 檢查更新，並配對目前介面語言的更新日誌
- 顯示安裝包摘要，方便手動驗證完整性

## 下載

- Windows：`.exe` 和 `.msi`
- macOS：`.dmg` 和 `.app`
- Linux：`.deb`、`.rpm` 和 `.AppImage`

請從 [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest) 下載正式發布檔案。

## 本機開發

```bash
npm install
npm run tauri:dev
```

如果 PowerShell 阻擋 `npm.ps1`，請使用：

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

## 建置

```bash
npm run tauri:build
```

建置產物位於 `src-tauri/target/release/bundle/`。

## 語言與更新

UI 翻譯分別保存在 `src/i18n/locales`。發布說明維護在 [RELEASE_NOTES.md](../../RELEASE_NOTES.md)，使用明確的 `<!-- lang:xx -->` 語言區塊。更新檢查會優先讀取目前 UI 語言，然後回退英文，最後回退完整 Release 正文。

## 授權

本專案使用 [FileNavigation Non-Commercial Source License](../../LICENSE.md)。禁止商業使用、轉售、SaaS 託管、收費託管服務、閉源商業整合和商業產品綑綁。
