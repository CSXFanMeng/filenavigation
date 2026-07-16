# FileNavigation

[すべての言語](../../README.md) · [最新リリース](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation は、選択したローカルディレクトリ内のファイルとフォルダーを検索する Rust + Tauri デスクトップアプリです。検索はすべてローカルで実行され、名前、パス、内容はアップロードされません。

## 機能

- ローカルのファイルとフォルダーを検索
- キャンセルとリアルタイム進行状況に対応した完全非同期 Rust/Tauri バックエンド
- 結果の絞り込み、種類フィルター、並べ替え、段階的表示
- Lucide アイコンとアクセシブルなフォーカスを備えたレスポンシブ UI
- アプリ独自の境界線と多言語操作を備えたフレームレスウィンドウ
- 固定ワークスペースと独立してスクロールする結果一覧
- 個別言語ファイルによる 20 言語のインターフェース
- タイトルバーの更新ウィンドウでスクロール可能な多言語 GitHub 更新履歴を表示し、署名済み自動インストールに対応
- 保存されるライト・ダークテーマを備えた設定ウィンドウ
- インストーラーのダイジェスト表示

## ダウンロード

- Windows：`.exe`、`.msi`
- macOS：`.dmg`、`.app`
- Linux：`.deb`、`.rpm`、`.AppImage`

[GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest) からダウンロードできます。

## 開発とビルド

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

PowerShell が `npm.ps1` をブロックする場合は `npm.cmd` を使用してください。成果物は `src-tauri/target/release/bundle/` に生成されます。

## 言語と更新

翻訳は `src/i18n/locales` に分離されています。[RELEASE_NOTES.md](../../RELEASE_NOTES.md) は `<!-- lang:xx -->` ブロックを使用します。更新確認は現在の言語、英語、Release 全文の順にフォールバックします。

## OpenAI Codex と GPT-5.6 を使用

OpenAI Codex と GPT-5.6 は、アーキテクチャ、キャンセル可能な非同期検索、モジュール化された国際化、レスポンシブでフレームレスな UI のデバッグ、クロスプラットフォーム CI とリリースの自動化、多言語ドキュメント、継続的なビルドおよびテスト検証における開発協力ツールとして使用されました。

AI は開発時にのみ使用されています。FileNavigation は実行時に OpenAI サービスを呼び出さず、ファイル名、パス、検索内容、ファイル内容をモデルへ送信しません。

## ライセンス

本プロジェクトは [FileNavigation Non-Commercial Source License](../../LICENSE.md) を使用します。商用利用、再販売、SaaS ホスティング、有料管理サービス、クローズドな商用統合、商用製品への同梱は禁止されています。
