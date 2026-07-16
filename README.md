# FileNavigation

A fast, private, cross-platform desktop file search application built with Rust and Tauri.

## Built With OpenAI Codex And GPT-5.6

OpenAI Codex and GPT-5.6 were used as engineering collaborators throughout FileNavigation's development. They helped:

- Explore the repository and define the Rust/Tauri architecture
- Design cancellable asynchronous search and live progress reporting
- Refactor UI translations into 20 independent locale files
- Diagnose responsive layout, frameless-window, and Windows GUI-subsystem issues
- Build and review the GitHub Actions cross-platform release pipeline
- Create multilingual documentation and language-aware release notes
- Run iterative verification with frontend builds, Rust checks and tests, CI results, and executable-header inspection

AI was used during development only. FileNavigation does not call OpenAI services at runtime and does not send file names, paths, search queries, or file contents to a model.

## Highlights

- Fully asynchronous, cancellable local file search with live progress
- Responsive frameless interface with independent result and release-note scrolling
- 20 complete interface languages stored in independent locale files
- Persistent light and dark themes in a category-based settings window
- Language-matched GitHub Release notes and signed automatic updates for the current OS and CPU architecture

The signed updater trust chain begins with v0.1.6. Users upgrading from v0.1.5 must install v0.1.6 manually once; later signed releases can download, install, and restart automatically.

Complete project documentation is available in the same 20 languages supported by the application.

| Language | Documentation | Language | Documentation |
| --- | --- | --- | --- |
| English | [Read](docs/readme/README.en.md) | 简体中文 | [阅读](docs/readme/README.zh-CN.md) |
| 繁體中文 | [閱讀](docs/readme/README.zh-TW.md) | Español | [Leer](docs/readme/README.es.md) |
| Français | [Lire](docs/readme/README.fr.md) | Deutsch | [Lesen](docs/readme/README.de.md) |
| 日本語 | [読む](docs/readme/README.ja.md) | 한국어 | [읽기](docs/readme/README.ko.md) |
| Português (Brasil) | [Ler](docs/readme/README.pt-BR.md) | Русский | [Читать](docs/readme/README.ru.md) |
| العربية | [قراءة](docs/readme/README.ar.md) | हिन्दी | [पढ़ें](docs/readme/README.hi.md) |
| Italiano | [Leggi](docs/readme/README.it.md) | Nederlands | [Lezen](docs/readme/README.nl.md) |
| Türkçe | [Oku](docs/readme/README.tr.md) | Tiếng Việt | [Đọc](docs/readme/README.vi.md) |
| Bahasa Indonesia | [Baca](docs/readme/README.id.md) | ไทย | [อ่าน](docs/readme/README.th.md) |
| Polski | [Czytaj](docs/readme/README.pl.md) | Українська | [Читати](docs/readme/README.uk.md) |

[Latest Release](https://github.com/CSXFanMeng/filenavigation/releases/latest) · [Multilingual Release Notes](RELEASE_NOTES.md) · [Non-Commercial License](LICENSE.md)
