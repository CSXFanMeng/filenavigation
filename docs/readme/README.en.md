# FileNavigation

[All languages](../../README.md) · [Latest Release](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation is a Rust + Tauri desktop application for finding files and folders inside a selected local directory. Searches run entirely on the local computer; file names, paths, and content are not uploaded.

## Features

- Local file and folder search under a chosen directory
- Literal or regular-expression file-name matching with case control
- Fully asynchronous Rust/Tauri backend with cancellation and live progress
- Result filtering, type filtering, sorting, and progressive rendering
- Modern responsive interface with Lucide icons and accessible focus states
- Frameless app-drawn window with draggable, localized controls
- Fixed workspace with an independently scrolling results list
- 20-language interface stored in independent locale files
- Title-bar update window with scrollable language-matched GitHub Release notes and signed automatic installation
- Settings window with persistent light and dark theme presets
- Installer digest display for manual integrity verification

## Downloads

- Windows: `.exe` and `.msi`
- macOS: `.dmg` and `.app`
- Linux: `.deb`, `.rpm`, and `.AppImage`

Download signed release artifacts from [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest).

## Development

```bash
npm install
npm run tauri:dev
```

If PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

## Build

```bash
npm run tauri:build
```

Build output is written to `src-tauri/target/release/bundle/`.

## Languages And Updates

UI translations are stored separately under `src/i18n/locales`. Release notes are maintained in [RELEASE_NOTES.md](../../RELEASE_NOTES.md) using explicit `<!-- lang:xx -->` blocks. The update checker requests the current UI language, then falls back to English and finally to the raw Release body.

## Built With OpenAI Codex And GPT-5.6

OpenAI Codex and GPT-5.6 were used as engineering collaborators for architecture, cancellable asynchronous search, modular internationalization, responsive and frameless UI debugging, cross-platform CI and release automation, multilingual documentation, and iterative build and test verification.

AI is used only during development. FileNavigation does not call OpenAI services at runtime or send file names, paths, search queries, or file contents to a model.

## License

This project uses the [FileNavigation Non-Commercial Source License](../../LICENSE.md). Commercial use, resale, SaaS hosting, paid managed services, closed-source commercial integration, and commercial product bundling are prohibited.
