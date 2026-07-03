# FileNavigation

FileNavigation 是一个使用 Rust + Tauri 编写的本地目录文件查找工具。它在本机扫描指定目录，按文件名关键字返回匹配项，不上传文件名、路径或文件内容。

## 功能

- 指定本地目录搜索文件和文件夹
- Rust 异步命令封装文件系统扫描
- 现代化桌面 UI，支持 Windows、Linux、macOS
- 支持区分大小写、包含隐藏文件、结果数量上限
- 一键打开匹配路径
- Tauri 打包配置覆盖 Windows `exe`/`msi`、macOS `dmg`/`app`、Linux `deb`/`rpm`/`AppImage`

## 技术栈

- Rust 2024 Edition
- Tauri 2
- Tokio
- Vanilla JavaScript + Vite

## 开发环境

需要安装：

- Rust 最新稳定版
- Node.js 20 或更新版本
- Windows: WebView2 Runtime
- Linux: Tauri 所需系统依赖，例如 `webkit2gtk`、`libayatana-appindicator`、`librsvg`
- macOS: Xcode Command Line Tools

## 本地运行

```bash
npm install
npm run tauri:dev
```

在 PowerShell 执行策略阻止 `npm.ps1` 时，可以使用：

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

## 构建安装包

```bash
npm run tauri:build
```

构建产物位于：

```text
src-tauri/target/release/bundle/
```

平台产物：

- Windows: `nsis` 生成 `.exe` 安装器，`msi` 生成 `.msi`
- macOS: `dmg` 和 `.app`
- Linux: `deb`、`rpm`、`AppImage`

跨平台桌面应用通常需要在对应系统上构建对应平台安装包。CI 可以使用 GitHub Actions 分别在 `windows-latest`、`macos-latest`、`ubuntu-latest` 上构建。

## 开源与非商业限制

本项目使用 [FileNavigation Non-Commercial Source License](./LICENSE.md)。源码可阅读、学习、修改和非商业分发，但禁止商业化使用、销售、SaaS 化、收费托管、闭源集成或作为商业产品的一部分分发。

注意：限制商业用途的许可证通常不符合 OSI 对“开源许可证”的定义。本项目采用“源码开放 + 非商业限制”的授权方式，以防止软件被商业化。

## 发布到 GitHub

已安装 GitHub CLI 并完成登录后：

```bash
git init
git add .
git commit -m "Initial release"
gh repo create filenavigation --public --source . --remote origin --push
```
