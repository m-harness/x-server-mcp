# APIクライアント設計

前提: Xserver APIの認証・レート制限・エラー形式は [requirements.md](../requirements.md) を参照。

## XServerApiClient クラス

HTTPリクエストの共通処理を担当するクラス。全ツールからこのクラスを経由してXserver APIを呼び出す。

### クラス概要

```typescript
import { Config } from '../utils/config.js';
import { RateLimiter } from './rate-limiter.js';
import { Logger } from '../utils/logger.js';
import { XServerApiError } from '../utils/errors.js';

export class XServerApiClient {
  private readonly baseUrl = 'https://api.xserver.ne.jp';
  private readonly apiKey: string;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: Logger;

  constructor(config: Config) { ... }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> { ... }
  async post<T>(path: string, body?: unknown): Promise<T> { ... }
  async put<T>(path: string, body?: unknown): Promise<T> { ... }
  async delete<T>(path: string, body?: unknown): Promise<T> { ... }

  // サーバー名付きパスを構築するヘルパー
  serverPath(servername: string, resource: string): string {
    return `/v1/server/${servername}/${resource}`;
  }
}
```

### リクエスト処理フロー

```
ツール呼び出し
  ↓
XServerApiClient.get/post/put/delete()
  ↓
1. レート制限チェック（RateLimiter.acquire()）
     → 制限超過時: Retry-After秒だけ待機して再試行
  ↓
2. HTTPリクエスト送信
     - Authorization: Bearer {apiKey}
     - Content-Type: application/json（POST/PUT時）
  ↓
3. レスポンスヘッダーからレート制限情報を更新
     - X-RateLimit-Remaining
     - X-RateLimit-Reset
  ↓
4. レスポンス処理
     - 200: JSONパースして返す
     - 429: Retry-After秒待機 → 再試行（最大3回）
     - 4xx/5xx: XServerApiError をスロー
  ↓
5. ログ記録
     - リクエスト: メソッド、パス、ステータスコード
     - エラー: 全情報をファイルログに記録
     - パスワード等の機密パラメータはマスキング
```

## 認証ヘッダー付与

```typescript
private buildHeaders(hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${this.apiKey}`,
  };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}
```

- `apiKey` はコンストラクタ時に `Config` から取得
- ヘッダー値をログに出力しない

## レート制限管理（RateLimiter）

### 方式: レスポンスヘッダー追従型

Xserver APIのレスポンスヘッダーからレート制限状態を取得し、それに基づいて制御する。
クライアント側でのスライディングウィンドウ管理は行わない（APIが正確な情報を返すため）。

```typescript
export class RateLimiter {
  private remaining: number = Infinity;
  private resetAt: number = 0;
  private concurrentRemaining: number = Infinity;

  // リクエスト前に呼ぶ。制限に達していたら待機時間を返す
  async acquire(): Promise<void> { ... }

  // レスポンスヘッダーから状態を更新
  updateFromHeaders(headers: Headers): void { ... }
}
```

### 動作

1. `remaining === 0` の場合、`resetAt` まで待機
2. `concurrentRemaining === 0` の場合、短時間（1秒）待機してリトライ
3. レスポンスヘッダーで状態を常に更新

## エラーハンドリング

### XServerApiError

```typescript
export class XServerApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly errorMessage: string,
    public readonly errors: string[] = [],
  ) {
    super(`[${errorCode}] ${errorMessage}`);
  }

  // MCP TextContent 形式に変換
  toMcpResponse() {
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          error: {
            code: this.errorCode,
            message: this.errorMessage,
            errors: this.errors,
          }
        }, null, 2),
      }],
      isError: true,
    };
  }
}
```

### リトライ対象

| ステータス | 動作 |
|-----------|------|
| 429 | `Retry-After`秒待機 → 最大3回リトライ |
| 502 | 5秒待機 → 最大2回リトライ |
| 400/401/403/404/409/422/500 | リトライせずエラーを返す |

## ロガー

### 設計方針

- MCP stdioトランスポートでは `stdout` がJSON-RPC専用のため、`console.log()` は使用禁止
- デバッグ出力は `console.error()`（stderr）を使用
- 詳細ログはファイルに出力

```typescript
export class Logger {
  constructor(private readonly logDir: string, private readonly level: LogLevel) {}

  debug(message: string, meta?: Record<string, unknown>): void { ... }
  info(message: string, meta?: Record<string, unknown>): void { ... }
  warn(message: string, meta?: Record<string, unknown>): void { ... }
  error(message: string, error?: Error, meta?: Record<string, unknown>): void { ... }
}
```

### ログ形式

```
[2026-04-16T12:00:00.000Z] [INFO] GET /v1/server/xs123456.xsrv.jp/cron -> 200 (125ms)
[2026-04-16T12:00:01.000Z] [ERROR] POST /v1/server/xs123456.xsrv.jp/mail -> 422 VALIDATION_ERROR
```

### 機密情報のマスキング

以下のフィールドはログ出力時にマスキング:
- `password` → `"****"`
- `admin_password` → `"****"`
- `apiKey` / `Authorization` ヘッダー → `"xs_****"`

## 設定管理（Config）

```typescript
export interface Config {
  apiKey: string;           // 必須: XSERVER_API_KEY
  defaultServerName?: string; // 任意: XSERVER_SERVER_NAME
  logLevel: LogLevel;       // デフォルト: 'info'
  logDir: string;           // デフォルト: './logs'
}

export function loadConfig(): Config {
  const apiKey = process.env.XSERVER_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 XSERVER_API_KEY が設定されていません');
  }
  return {
    apiKey,
    defaultServerName: process.env.XSERVER_SERVER_NAME,
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'info',
    logDir: process.env.LOG_DIR ?? './logs',
  };
}
```

## テスト方針

- `XServerApiClient` のテストはHTTPリクエストをモック（`vi.fn()` や `msw`）
- `RateLimiter` は単体テスト可能（外部依存なし）
- テストファイルは同一ディレクトリに配置（CLAUDE.mdルール準拠）
- テストカバレッジをファイルトップにコメントで記載
