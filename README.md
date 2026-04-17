# x-server-mcp

Xserver の REST API を MCP (Model Context Protocol) サーバーとして利用するためのプロジェクトです。  
Xserver の API キーを使って、サーバー情報取得、Cron、WordPress、メール、DNS、SSL などを MCP ツールとして操作できます。

## 公開向けファイル構成

GitHub に公開する前提では、次の構成がそのまま分かりやすく安全です。

```text
x-server-mcp/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── src/
└── docs/
    ├── requirements.md
    ├── testing.md
    ├── tasks.md
    ├── architecture/
    ├── design/
    └── x-server-api/
```

ローカル専用ファイルや内部メモは `.gitignore` で除外しています。  
公開しない対象の例は `.env*`、`logs/`、`coverage/`、`dist/`、`.claude/`、`AGENTS.md`、`CLAUDE.md`、`memo.md`、`api-docs.md` です。

## 必要環境

- Node.js 20 以上
- npm
- Xserver の API キー

## セットアップ

```bash
npm install
npm run build
```

開発中は次でも起動できます。

```bash
npm run dev
```

## 認証の考え方

このプロジェクトの認証情報は、基本的に **MCP クライアント設定の `env` に書く** のが推奨です。  
API キーをソースコードへ直書きしたり、Git 管理下の設定ファイルへ保存したりしないでください。

### 使用する環境変数

| 環境変数 | 必須 | 説明 |
|---------|------|------|
| `XSERVER_API_KEY` | 必須 | Xserver で発行した API キー |
| `XSERVER_SERVER_NAME` | 任意 | デフォルトで利用するサーバー名 |
| `LOG_LEVEL` | 任意 | `debug` / `info` / `warn` / `error` |
| `LOG_DIR` | 任意 | ログ出力先ディレクトリ |

### `XSERVER_SERVER_NAME` は何を書くか

`XSERVER_SERVER_NAME` には、デフォルトで使いたいサーバー名を書きます。

```text
XSERVER_SERVER_NAME=xs123456.xsrv.jp
```

これは必須ではありませんが、複数サーバーを扱う場合や、毎回 `servername` を指定したくない場合に便利です。

### どこに認証情報を書くべきか

推奨順は次のとおりです。

1. MCP クライアント設定の `env`
2. ローカル実行時のシェル環境変数
3. ローカル専用の `.env` ファイル

`.env` を使う場合でも、必ず Git に含めない運用にしてください。このリポジトリでは `.gitignore` で除外しています。

## Claude Desktop での MCP 登録例

`claude_desktop_config.json` の `mcpServers` に追加します。  
認証情報は `env` に書きます。

```json
{
  "mcpServers": {
    "xserver": {
      "command": "node",
      "args": [
        "C:\\Users\\your-name\\path\\to\\x-server-mcp\\dist\\index.js"
      ],
      "env": {
        "XSERVER_API_KEY": "xs_xxxxxxxxxxxx",
        "XSERVER_SERVER_NAME": "xs123456.xsrv.jp",
        "LOG_LEVEL": "info",
        "LOG_DIR": "C:\\Users\\your-name\\path\\to\\x-server-mcp\\logs"
      }
    }
  }
}
```

設定ポイント:

- `command`: 通常は `node`
- `args[0]`: このプロジェクトの `dist/index.js` の絶対パス
- `env.XSERVER_API_KEY`: Xserver で発行した API キー
- `env.XSERVER_SERVER_NAME`: 必要なら既定サーバー名
- `env.LOG_DIR`: 任意。未指定でも動作可能

## ローカル起動例

PowerShell で確認する場合の例です。

```powershell
$env:XSERVER_API_KEY="xs_xxxxxxxxxxxx"
$env:XSERVER_SERVER_NAME="xs123456.xsrv.jp"
npm run dev
```

ビルド済み成果物で確認する場合:

```powershell
$env:XSERVER_API_KEY="xs_xxxxxxxxxxxx"
$env:XSERVER_SERVER_NAME="xs123456.xsrv.jp"
npm run build
npm start
```

## 初回確認手順

1. Xserver で API キーを発行する
2. `npm install` と `npm run build` を実行する
3. Claude Desktop の `mcpServers` に `xserver` を登録する
4. `env` に `XSERVER_API_KEY` を設定する
5. Claude Desktop を再起動する
6. `apikey-info` や `server-info` を呼んで疎通確認する

## ドキュメント

- [要件定義](./docs/requirements.md)
- [アーキテクチャ概要](./docs/architecture/overview.md)
- [MCP ツール設計](./docs/design/mcp-tools.md)
- [API クライアント設計](./docs/design/api-client.md)
- [テスト方針と要約](./docs/testing.md)
- [実装タスク記録](./docs/tasks.md)
- [Xserver API 仕様メモ](./docs/x-server-api/index.md)

## 補足

- `package.json` の `"private": true` は GitHub 公開の妨げにはなりません
- npm 公開まで行う場合だけ、ライセンス表記や `private` 設定の見直しを検討してください
