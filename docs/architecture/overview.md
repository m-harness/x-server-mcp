# アーキテクチャ概要

## レイヤー構成

```
┌──────────────────────────────────┐
│       AIエージェント (Claude等)     │
└────────────┬─────────────────────┘
             │ JSON-RPC (stdio)
┌────────────▼─────────────────────┐
│        MCP Server Layer          │
│  - McpServer インスタンス          │
│  - stdio トランスポート            │
│  - ツール登録・ルーティング          │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│         Tools Layer              │
│  - 各カテゴリのツール定義           │
│  - Zodスキーマによるバリデーション     │
│  - 入力変換・レスポンス整形          │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│       API Client Layer           │
│  - XServerApiClient クラス        │
│  - 認証ヘッダー付与               │
│  - レート制限管理                  │
│  - エラーハンドリング               │
│  - リトライ処理                    │
└────────────┬─────────────────────┘
             │ HTTPS
┌────────────▼─────────────────────┐
│       Xserver REST API           │
│  https://api.xserver.ne.jp       │
└──────────────────────────────────┘
```

## ディレクトリ構造

```
x-server-mcp/
├── src/
│   ├── index.ts              # エントリポイント（MCPサーバー起動）
│   ├── server.ts             # McpServer設定・ツール登録
│   ├── client/
│   │   ├── api-client.ts     # XServerApiClient
│   │   ├── api-client.test.ts
│   │   ├── rate-limiter.ts   # レート制限管理
│   │   └── rate-limiter.test.ts
│   ├── tools/
│   │   ├── index.ts          # ツール一括登録
│   │   ├── api-key.ts        # APIキー情報ツール
│   │   ├── server-info.ts    # サーバー情報ツール
│   │   ├── cron.ts           # Cron設定ツール
│   │   ├── wordpress.ts      # WordPress管理ツール
│   │   ├── mail.ts           # メールアカウント・転送ツール
│   │   ├── mail-filter.ts    # メール振り分けツール
│   │   ├── ftp.ts            # FTPアカウントツール
│   │   ├── database.ts       # MySQLツール（DB・ユーザー・権限）
│   │   ├── php-version.ts    # PHPバージョンツール
│   │   ├── domain.ts         # ドメイン設定ツール
│   │   ├── subdomain.ts      # サブドメインツール
│   │   ├── ssl.ts            # SSL設定ツール
│   │   ├── dns.ts            # DNSレコードツール
│   │   ├── logs.ts           # アクセスログ・エラーログツール
│   │   └── *.test.ts         # 各ツールのテスト（同一ディレクトリ）
│   ├── utils/
│   │   ├── logger.ts         # ロガー（ファイル出力）
│   │   ├── config.ts         # 設定管理
│   │   └── errors.ts         # エラー型定義
│   └── types/
│       └── xserver-api.ts    # Xserver APIの型定義
├── docs/                     # 設計ドキュメント
├── logs/                     # ログ出力先（.gitignore対象）
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── CLAUDE.md
└── .env                      # APIキー（.gitignore対象）
```

## トランスポート選択: stdio

MCPサーバーのトランスポートには **stdio**（標準入出力）を採用する。

### 理由
- ローカル環境でのAIエージェント連携が主用途
- セットアップが最も簡単（CLIから直接起動）
- Claude Desktopとの統合に最適
- ネットワーク越しのアクセスは不要（APIキーがローカルにある前提）

### 制約
- `stdout` はJSON-RPC通信専用。アプリケーションの出力は一切書き込まない
- ログ出力は `console.error()`（stderr）+ ファイルログを使用

## セキュリティ設計方針

### APIキー管理
- 環境変数 `XSERVER_API_KEY` から取得
- コード・ログ・エラーメッセージにAPIキーを含めない
- APIキーのマスキング: ログ出力時は `xs_****` 形式に
- .envファイルは .gitignore に含める

### 破壊的操作の安全策
- DELETE操作・リセット操作はツール説明に「この操作は元に戻せません」を明記
- WordPress削除のような連鎖削除が発生する操作は、デフォルト値を安全側に設定
- パスワード系のパラメータはログに出力しない

### 入力バリデーション
- Zodスキーマで全入力パラメータを検証
- サーバー名（servername）の形式チェック
- メールアドレス・ドメイン名の形式チェック

### エラー情報の取り扱い
- Xserver APIからのエラーレスポンスはそのままユーザーに返す
- 内部エラー（ネットワーク障害等）はスタックトレースを除いたメッセージのみ返す
- 全エラーをファイルログに記録（スタックトレース含む）

## 設定管理

環境変数による設定:

| 環境変数 | 必須 | デフォルト | 説明 |
|---------|------|-----------|------|
| `XSERVER_API_KEY` | Yes | - | Xserver APIキー |
| `XSERVER_SERVER_NAME` | No | - | デフォルトサーバー名（省略時はツール引数で指定） |
| `LOG_LEVEL` | No | `info` | ログレベル（debug/info/warn/error） |
| `LOG_DIR` | No | `./logs` | ログファイル出力先 |
