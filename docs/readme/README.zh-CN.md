# FileNavigation

[全部语言](../../README.md) · [最新版本](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation 是一个使用 Rust + Tauri 编写的桌面应用，用于在指定本地目录中查找文件和文件夹。搜索完全在本机执行，不会上传文件名、路径或文件内容。

## 功能

- 在指定目录下搜索本地文件和文件夹
- 全异步 Rust/Tauri 后端，支持取消搜索和实时进度
- 结果过滤、类型过滤、排序及大量结果渐进渲染
- 使用 Lucide 图标的现代化响应式界面，并提供无障碍焦点状态
- 应用自行绘制无边框窗口，提供可拖拽的多语言窗口控制
- 主工作区固定在窗口内，结果列表独立滚动
- 20 种语言界面，翻译保存在独立语言文件中
- 根据 GitHub 最新 Release 检查更新，并匹配当前界面语言的更新日志
- 显示安装包摘要，便于手动校验完整性

## 下载

- Windows：`.exe` 和 `.msi`
- macOS：`.dmg` 和 `.app`
- Linux：`.deb`、`.rpm` 和 `.AppImage`

请从 [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest) 下载正式发布产物。

## 本地开发

```bash
npm install
npm run tauri:dev
```

如果 PowerShell 阻止 `npm.ps1`，请使用：

```powershell
npm.cmd install
npm.cmd run tauri:dev
```

## 构建

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 语言与更新

UI 翻译分别保存在 `src/i18n/locales`。发布说明维护在 [RELEASE_NOTES.md](../../RELEASE_NOTES.md)，使用明确的 `<!-- lang:xx -->` 语言块。更新检查优先读取当前 UI 语言，然后回退英文，最后回退完整 Release 正文。

## 许可证

本项目使用 [FileNavigation Non-Commercial Source License](../../LICENSE.md)。禁止商业使用、转售、SaaS 托管、收费托管服务、闭源商业集成和商业产品捆绑。
