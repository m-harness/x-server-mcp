# タスク一覧

## Phase 0: プロジェクト初期化

- `package.json` 作成（name, type: module, scripts）
- `tsconfig.json` 作成（ES Modules, Node.js 20+対応）
- `vitest.config.ts` 作成
- `.gitignore` 更新（logs/, node_modules/, .env, dist/）
- 依存パッケージのインストール
  - `@modelcontextprotocol/sdk` (v1.29.x)
  - `zod` (v3.x)
  - `typescript` (v5.x, devDependency)
  - `vitest` (v2.x, devDependency)
  - `tsx` (devDependency, 開発時実行用)
- `src/` ディレクトリ構造の作成

## Phase 1: 基盤レイヤー実装

- `src/utils/errors.ts` - XServerApiError クラス
- `src/utils/errors.test.ts` - エラークラスのテスト
- `src/utils/logger.ts` - ロガー（stderr + ファイル出力）
- `src/utils/logger.test.ts` - ロガーのテスト
- `src/utils/config.ts` - 設定管理（環境変数読み込み）
- `src/utils/config.test.ts` - 設定管理のテスト
- `src/types/xserver-api.ts` - Xserver APIの型定義

## Phase 2: APIクライアント実装

- `src/client/rate-limiter.ts` - レート制限管理
- `src/client/rate-limiter.test.ts` - レート制限のテスト
- `src/client/api-client.ts` - XServerApiClient
- `src/client/api-client.test.ts` - APIクライアントのテスト（HTTPモック）

## Phase 3: MCPサーバー・ツール実装

### 3-0: 共通基盤

- `src/tools/helpers.ts` + テスト - 共通ヘルパー
- `src/tools/__test-helpers.ts` - テスト用モックユーティリティ

### 3-1: サーバー起動・情報系

- `src/index.ts` - エントリポイント
- `src/server.ts` - McpServer設定
- `src/tools/api-key.ts` + テスト - APIキー情報（1ツール）
- `src/tools/server-info.ts` + テスト - サーバー情報（2ツール）

### 3-2: Cron・WordPress

- `src/tools/cron.ts` + テスト - Cron設定（4ツール）
- `src/tools/wordpress.ts` + テスト - WordPress管理（4ツール）

### 3-3: メール系

- `src/tools/mail.ts` + テスト - メールアカウント（5ツール）+ 転送（2ツール）
- `src/tools/mail-filter.ts` + テスト - メール振り分け（3ツール）

### 3-4: FTP・MySQL

- `src/tools/ftp.ts` + テスト - FTPアカウント（4ツール）
- `src/tools/database.ts` + テスト - MySQL DB・ユーザー・権限（11ツール）

### 3-5: ドメイン・SSL・DNS

- `src/tools/domain.ts` + テスト - ドメイン設定（6ツール）
- `src/tools/subdomain.ts` + テスト - サブドメイン（4ツール）
- `src/tools/ssl.ts` + テスト - SSL設定（3ツール）
- `src/tools/dns.ts` + テスト - DNSレコード（4ツール）

### 3-6: PHP・ログ

- `src/tools/php-version.ts` + テスト - PHPバージョン（2ツール）
- `src/tools/logs.ts` + テスト - アクセスログ・エラーログ（2ツール）

### 3-7: ツール統合

- `src/tools/index.ts` - 全ツールの一括登録

## Phase 4: 統合テスト・動作確認

- ビルド設定確認（TypeScriptコンパイル）
- `src/server.test.ts` - 57ツール登録確認テスト
- 全テスト実行・カバレッジ確認（99.04%）

## Phase 5: ドキュメント・仕上げ

- テストの要約ドキュメント作成（`docs/testing.md`）
- Claude Desktop用設定例を `docs/README.md` に追記
- APIキー発行・環境変数設定手順を `docs/README.md` に追記

## Phase 6: ID型仕様不整合の修正

- `src/tools/cron.ts` - `cron_id` をハッシュID文字列へ修正し、一覧結果をそのまま更新・削除に使えるよう統一
- `src/tools/wordpress.ts` - `wp_id` を文字列IDへ修正し、WordPress一覧との整合を回復
- `src/tools/mail-filter.ts` - `filter_id` を文字列IDへ修正し、振り分け一覧との整合を回復
- `src/tools/cron.test.ts` - ハッシュID文字列の正常系と数値拒否のスキーマ検証を追加
- `src/tools/wordpress.test.ts` - 文字列IDの正常系と数値拒否のスキーマ検証を追加
- `src/tools/mail-filter.test.ts` - 文字列IDの正常系と数値拒否のスキーマ検証を追加
- `docs/design/mcp-tools.md` - `cron_id`、`wp_id`、`filter_id` が一覧取得結果の文字列IDであることを明記
- `docs/testing.md` - 仕様書と入力スキーマの型一致確認をテスト方針に追記
- 完了条件: `docs/x-server-api` と実装のID型が一致し、数値IDが拒否され、`npm test` が成功する

## Phase 7: テスト基盤と障害系ケースの強化

- `src/index.test.ts` - 起動成功、`loadConfig()` 失敗、`server.connect()` 失敗時の終了経路を追加
- `src/server.test.ts` - `McpServer` 全面モックをやめ、実際の SDK `tool()` 呼び出しを監視して57ツール登録を検証
- `src/tools/__test-helpers.ts` - キャプチャした schema を `z.object(...).parse()` に通し、ツールテストでも入力検証を有効化
- `src/tools/logs.test.ts` - 仕様書どおり `{ domain, log }` のレスポンス契約を検証し、`domain` 必須も確認
- `src/tools/mail-filter.test.ts` - enum 不正値が入力検証で落ちるケースを追加
- `src/client/api-client.test.ts` - `fetch` 失敗、成功/失敗レスポンスでの `json()` 失敗を追加
- `docs/testing.md` - テスト件数、カバレッジ、起動経路/障害系の方針を更新
- 完了条件: `npm test` と `npm run test:coverage` が成功し、`src/index.ts` のカバレッジが 100% になる

## Phase 8: 利用手順と認証ドキュメントの整備

- `docs/README.md` - APIキー発行時の推奨設定、環境変数の意味、`XSERVER_SERVER_NAME` の扱いを追記
- `docs/README.md` - 認証情報をどこに書くべきか（MCPクライアントの `env` 推奨）を明文化
- `docs/README.md` - Claude Desktop の MCP 登録例を Windows 前提の絶対パス付きで具体化
- `docs/README.md` - PowerShell でのローカル起動例、初回確認手順、認証FAQ を追加
- 完了条件: 初見の利用者が「どこに認証情報を書くか」「どうMCP登録するか」を README だけで判断できる

## Phase 9: OSS 公開向けドキュメント整理

- `README.md` - GitHub のトップページ向けに新設し、セットアップ、認証、MCP 登録、公開構成を集約
- `docs/README.md` - ルート README を正とする案内ページへ整理
- `.gitignore` - `.env`、ビルド成果物、ログ、内部メモ、エージェント向けファイルを公開対象から除外
- 完了条件: GitHub 公開時に README が入口として機能し、機密情報や内部運用ファイルが誤って追跡されにくい状態になっている
