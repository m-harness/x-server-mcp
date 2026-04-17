# テスト要約

## テスト実行方法

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き実行
npm run test:coverage
```

## テストファイル一覧（22ファイル・136テスト）

### 基盤レイヤー

| ファイル | テスト数 | カバレッジ | 概要 |
|---------|---------|-----------|------|
| `src/utils/errors.test.ts` | 6 | 100% | XServerApiError: プロパティ設定、errors配列、toMcpResponse変換 |
| `src/utils/logger.test.ts` | 17 | 100% | Logger: ログレベルフィルタリング、マスキング（password/apiKey/Authorization）、ファイル出力、console.log不使用 |
| `src/utils/config.test.ts` | 6 | 100% | loadConfig: 環境変数読み取り、必須チェック、デフォルト値、バリデーション |

### APIクライアント

| ファイル | テスト数 | カバレッジ | 概要 |
|---------|---------|-----------|------|
| `src/client/rate-limiter.test.ts` | 6 | 100% | RateLimiter: ヘッダー追従、remaining=0待機、concurrent待機、リセット後動作 |
| `src/client/api-client.test.ts` | 17 | 100% | XServerApiClient: GET/POST/PUT/DELETE、クエリパラメータ、429/502リトライ、fetch失敗、json解析失敗、エラーハンドリング |

### ツール共通

| ファイル | テスト数 | カバレッジ | 概要 |
|---------|---------|-----------|------|
| `src/tools/helpers.test.ts` | 9 | 100% | resolveServername(優先順位)、successResponse、handleToolExecution(エラーキャッチ) |
| `src/index.test.ts` | 3 | 100% | index.ts: 起動成功、設定読み込み失敗、connect失敗時の終了経路 |

### 各ツール（57ツール）

| ファイル | テスト数 | 登録ツール数 | 概要 |
|---------|---------|------------|------|
| `src/tools/api-key.test.ts` | 2 | 1 | apikey-info |
| `src/tools/server-info.test.ts` | 4 | 2 | server-info, server-usage |
| `src/tools/cron.test.ts` | 6 | 4 | cron-list/create/update/delete、ハッシュID文字列スキーマ検証 |
| `src/tools/wordpress.test.ts` | 7 | 4 | wp-list/install/update/delete、文字列IDスキーマ検証 |
| `src/tools/mail.test.ts` | 7 | 7 | mail-list/get/create/update/delete, mail-forwarding-get/update |
| `src/tools/mail-filter.test.ts` | 5 | 3 | mail-filter-list/create/delete、文字列IDスキーマ検証、不正enumの入力検証 |
| `src/tools/ftp.test.ts` | 4 | 4 | ftp-list/create/update/delete |
| `src/tools/database.test.ts` | 11 | 11 | db-list/create/update/delete, db-user-list/create/update/delete, db-grant-list/add/remove |
| `src/tools/domain.test.ts` | 6 | 6 | domain-list/get/create/update/delete/reset |
| `src/tools/subdomain.test.ts` | 4 | 4 | subdomain-list/create/update/delete |
| `src/tools/ssl.test.ts` | 4 | 3 | ssl-list/create/delete |
| `src/tools/dns.test.ts` | 4 | 4 | dns-list/create/update/delete |
| `src/tools/php-version.test.ts` | 2 | 2 | php-version-list/update |
| `src/tools/logs.test.ts` | 4 | 2 | access-log, error-log、ログAPI契約と必須入力検証 |

### 統合テスト

| ファイル | テスト数 | 概要 |
|---------|---------|------|
| `src/server.test.ts` | 2 | createServer()初期化、57ツール登録確認 |

## カバレッジサマリー

| カテゴリ | Stmts | Branch | Funcs | Lines |
|---------|-------|--------|-------|-------|
| 全体 | 100% | 95.21% | 100% | 100% |
| src/client | 100% | 97.67% | 100% | 100% |
| src/tools | 100% | 94.96% | 100% | 100% |
| src/utils | 100% | 92.3% | 100% | 100% |

※ `src/types/xserver-api.ts`（型定義のみ）はテスト対象外

## テスト方針

- テスト駆動開発: テストを先に書き、実装を後に
- 各テストファイルのトップにカバレッジと処理概要をコメント記載
- テストファイルは実装ファイルと同じディレクトリに配置
- APIクライアントは `global.fetch` をモックし、ネットワーク例外・JSON解析失敗も含めて検証する
- ツールテストは `McpServer.tool()` 登録時のスキーマを `__test-helpers.ts` 側で `z.object(...).parse()` に通し、ハンドラ直呼びでも入力検証を再現する
- `vi.useFakeTimers()` でレート制限・リトライの時間制御
- 仕様書と入力スキーマの型一致を確認し、`docs/x-server-api` の path parameter 型を回帰テストで固定する
- `cron_id`、`wp_id`、`filter_id` は文字列IDを許可し、数値IDを拒否する `safeParse` テストを維持する
- `logs` 系は API 契約どおり `{ domain, log }` のレスポンス形を固定し、ドキュメントとの差分を検知する
