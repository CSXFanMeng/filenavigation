# FileNavigation

FileNavigation is a Rust + Tauri desktop app for searching files inside a selected local folder. Search runs on the local machine; file names, paths, and file content are not uploaded.

## Features

- Search files and folders under a chosen local directory
- Async Rust/Tauri commands with a non-blocking UI
- Responsive desktop UI for compact, tablet, and wide layouts
- Multilingual interface with automatic system-language detection
- Language switcher for mainstream languages and regions:
  English, Simplified Chinese, Traditional Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Russian, Arabic, Hindi, Italian, Dutch, Turkish, Vietnamese, Indonesian, Thai, Polish, and Ukrainian
- RTL layout support for Arabic
- Update checker based on the latest GitHub Release
- Release notes display for the detected latest version
- Case-sensitive search, hidden-file search, and configurable result limit
- Open matched paths from the result list
- Tauri packaging for Windows `exe`/`msi`, macOS `dmg`/`app`, and Linux `deb`/`rpm`/`AppImage`

## Tech Stack

- Rust 2024 Edition
- Tauri 2
- Tokio
- Vanilla JavaScript + Vite

## Development Requirements

- Latest stable Rust
- Node.js 20 or newer
- Windows: WebView2 Runtime
- Linux: Tauri system dependencies such as `webkit2gtk`, `libayatana-appindicator`, and `librsvg`
- macOS: Xcode Command Line Tools

## Local Development

```bash
npm install
npm run tauri:dev
```

If PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

## Build Installers

```bash
npm run tauri:build
```

Build output:

```text
src-tauri/target/release/bundle/
```

Platform packages:

- Windows: `.exe` installer from NSIS and `.msi`
- macOS: `.dmg` and `.app`
- Linux: `.deb`, `.rpm`, and `.AppImage`

Desktop packages are normally built on their target operating systems. The included GitHub Actions workflow builds Windows, macOS, and Linux packages separately and publishes them to a GitHub Release when a `v*` tag is pushed.

## Update Checking

The app checks `https://api.github.com/repos/CSXFanMeng/filenavigation/releases/latest` when the user presses the update button. It compares the latest GitHub Release tag with the current app version and displays the release notes returned by GitHub.

## License and Non-Commercial Restriction

This project uses the [FileNavigation Non-Commercial Source License](./LICENSE.md). You may read, study, modify, and redistribute the source for non-commercial purposes, but commercial use, resale, SaaS hosting, paid managed services, closed-source commercial integration, and commercial product bundling are prohibited.

Note: licenses that restrict commercial use generally do not satisfy the OSI definition of an open source license. This project is source-available with a non-commercial restriction to prevent commercialization.
