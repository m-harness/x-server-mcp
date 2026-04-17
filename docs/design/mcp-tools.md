# MCPツール設計

前提: 共通仕様（認証・レート制限・エラー形式）は [requirements.md](../requirements.md) を参照。

## 命名規則

- ケバブケース: `{カテゴリ}-{操作}`
- 操作名: `list` / `get` / `create` / `update` / `delete`
- 例: `mail-list`, `mail-create`, `domain-delete`

## ツール定義パターン

```typescript
server.registerTool(
  "cron-list",
  {
    description: "Cron設定の一覧を取得します",
    inputSchema: z.object({
      servername: z.string().optional().describe("サーバー名（省略時は環境変数のデフォルト値）"),
    }),
  },
  async ({ servername }) => {
    const result = await apiClient.get(`/v1/server/${name}/cron`);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);
```

## servername の扱い

全ツール共通で `servername` パラメータを持つ（APIキー情報を除く）。
- 環境変数 `XSERVER_SERVER_NAME` が設定されている場合はデフォルト値として使用
- ツール引数で明示的に指定した場合はそちらを優先

## ツール一覧（57エンドポイント → 57ツール、1対1マッピング）

MCPツールは1操作1ツールが最も使いやすい。AIエージェントが適切なツールを選択しやすくなる。

### 1. APIキー情報（1ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `apikey-info` | GET | `/v1/me` | 読取 | 認証中のAPIキー情報を取得 |

### 2. サーバー情報（2ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `server-info` | GET | `/server-info` | 読取 | サーバースペック・バージョン情報 |
| `server-usage` | GET | `/server-info/usage` | 読取 | ディスク使用量・各種設定件数 |

### 3. Cron設定（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `cron-list` | GET | `/cron` | 読取 | Cron一覧を取得 |
| `cron-create` | POST | `/cron` | 書込 | Cronを新規追加 |
| `cron-update` | PUT | `/cron/{cron_id}` | 書込 | Cronを変更（`cron_id` は一覧取得で得られるハッシュID文字列） |
| `cron-delete` | DELETE | `/cron/{cron_id}` | 書込 | Cronを削除（`cron_id` は一覧取得で得られるハッシュID文字列） |

### 4. WordPress（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `wp-list` | GET | `/wp` | 読取 | WordPress一覧を取得 |
| `wp-install` | POST | `/wp` | 書込 | WordPressを新規インストール |
| `wp-update` | PUT | `/wp/{wp_id}` | 書込 | WordPress設定を変更（メモのみ、`wp_id` は一覧取得で得られる文字列ID） |
| `wp-delete` | DELETE | `/wp/{wp_id}` | 書込 | WordPressを削除（`wp_id` は一覧取得で得られる文字列ID） |

### 5. メールアカウント（5ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `mail-list` | GET | `/mail` | 読取 | メールアカウント一覧 |
| `mail-get` | GET | `/mail/{mail_account}` | 読取 | メールアカウント詳細（使用量含む） |
| `mail-create` | POST | `/mail` | 書込 | メールアカウント作成（事前にドメイン所有権確認のTXTレコード設定が必要） |
| `mail-update` | PUT | `/mail/{mail_account}` | 書込 | メールアカウント変更 |
| `mail-delete` | DELETE | `/mail/{mail_account}` | 書込 | メールアカウント削除 |

### 6. メール転送（2ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `mail-forwarding-get` | GET | `/mail/{mail_account}/forwarding` | 読取 | 転送設定を取得 |
| `mail-forwarding-update` | PUT | `/mail/{mail_account}/forwarding` | 書込 | 転送設定を更新 |

### 7. メール振り分け（3ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `mail-filter-list` | GET | `/mail-filter` | 読取 | 振り分けルール一覧 |
| `mail-filter-create` | POST | `/mail-filter` | 書込 | 振り分けルール追加 |
| `mail-filter-delete` | DELETE | `/mail-filter/{filter_id}` | 書込 | 振り分けルール削除（`filter_id` は一覧取得で得られる文字列ID） |

### 8. FTPアカウント（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `ftp-list` | GET | `/ftp` | 読取 | FTPアカウント一覧 |
| `ftp-create` | POST | `/ftp` | 書込 | FTPアカウント追加 |
| `ftp-update` | PUT | `/ftp/{ftp_account}` | 書込 | FTPアカウント変更 |
| `ftp-delete` | DELETE | `/ftp/{ftp_account}` | 書込 | FTPアカウント削除 |

### 9. MySQL データベース（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `db-list` | GET | `/db` | 読取 | データベース一覧 |
| `db-create` | POST | `/db` | 書込 | データベース作成 |
| `db-update` | PUT | `/db/{db_name}` | 書込 | データベース変更（メモ） |
| `db-delete` | DELETE | `/db/{db_name}` | 書込 | データベース削除 |

### 10. MySQL ユーザー（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `db-user-list` | GET | `/db/user` | 読取 | MySQLユーザー一覧 |
| `db-user-create` | POST | `/db/user` | 書込 | MySQLユーザー作成 |
| `db-user-update` | PUT | `/db/user/{db_user}` | 書込 | MySQLユーザー変更 |
| `db-user-delete` | DELETE | `/db/user/{db_user}` | 書込 | MySQLユーザー削除 |

### 11. MySQL 権限（3ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `db-grant-list` | GET | `/db/user/{db_user}/grant` | 読取 | 権限一覧 |
| `db-grant-add` | POST | `/db/user/{db_user}/grant` | 書込 | 権限追加 |
| `db-grant-remove` | DELETE | `/db/user/{db_user}/grant` | 書込 | 権限削除 |

### 12. PHPバージョン（2ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `php-version-list` | GET | `/php-version` | 読取 | ドメイン別PHP設定一覧 |
| `php-version-update` | PUT | `/php-version/{domain}` | 書込 | PHPバージョン変更 |

### 13. ドメイン設定（6ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `domain-list` | GET | `/domain` | 読取 | ドメイン一覧 |
| `domain-get` | GET | `/domain/{domain}` | 読取 | ドメイン詳細 |
| `domain-create` | POST | `/domain` | 書込 | ドメイン追加（事前にドメイン所有権確認のTXTレコード設定が必要） |
| `domain-update` | PUT | `/domain/{domain}` | 書込 | ドメイン設定変更（メモ） |
| `domain-delete` | DELETE | `/domain/{domain}` | 書込 | ドメイン削除 |
| `domain-reset` | POST | `/domain/{domain}/reset` | 書込 | ドメイン設定を初期化（type: all/web/other） |

### 14. サブドメイン（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `subdomain-list` | GET | `/subdomain` | 読取 | サブドメイン一覧 |
| `subdomain-create` | POST | `/subdomain` | 書込 | サブドメイン追加 |
| `subdomain-update` | PUT | `/subdomain/{subdomain}` | 書込 | サブドメイン変更 |
| `subdomain-delete` | DELETE | `/subdomain/{subdomain}` | 書込 | サブドメイン削除 |

### 15. SSL設定（3ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `ssl-list` | GET | `/ssl` | 読取 | SSL設定一覧 |
| `ssl-create` | POST | `/ssl` | 書込 | SSL設定追加 |
| `ssl-delete` | DELETE | `/ssl/{common_name}` | 書込 | SSL設定削除 |

### 16. DNSレコード（4ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `dns-list` | GET | `/dns` | 読取 | DNSレコード一覧 |
| `dns-create` | POST | `/dns` | 書込 | DNSレコード追加 |
| `dns-update` | PUT | `/dns/{dns_id}` | 書込 | DNSレコード変更 |
| `dns-delete` | DELETE | `/dns/{dns_id}` | 書込 | DNSレコード削除 |

### 17. ログ（2ツール）

| ツール名 | メソッド | エンドポイント | スコープ | 説明 |
|---------|---------|--------------|---------|------|
| `access-log` | GET | `/access-log` | 読取 | アクセスログ取得 |
| `error-log` | GET | `/error-log` | 読取 | エラーログ取得 |

## 合計: 57エンドポイント → 57ツール（1対1マッピング）

## 破壊的操作の安全策

以下のツールは description に警告を含める:

- 全 `*-delete` ツール: 「この操作は元に戻せません」
- `wp-delete`: 「関連するデータベース・Cronも削除される可能性があります」
- `domain-delete`: 「ドメインに紐づくメールアカウント等も影響を受ける可能性があります。delete_filesオプションでディレクトリも削除可能」
- `domain-reset`: 「ドメイン設定を初期化します。type=allで全設定、web=Web領域のみ、other=Web以外を初期化。この操作は元に戻せません」
- `db-delete`: 「データベースに格納されているデータも全て削除されます」
- `ssl-delete`: 「SSL証明書を削除するとHTTPS通信ができなくなります」
- `wp-install`: 「管理者パスワードはログに記録されません」

## ドメイン所有権確認が必要なツール

以下のツールは、事前にドメイン所有権確認のTXTレコード設定が必要。description にその旨を含める。
詳細な手順は [共通仕様 > ドメイン所有権確認](../x-server-api/common.md#ドメイン所有権確認) を参照。

- `domain-create`: ドメイン追加時
- `mail-create`: メールアカウント作成時（サーバーに追加済みでないドメインの場合）

## 日本語ドメイン（IDN）の扱い

APIによって日本語ドメインの指定方法が異なるため、ツール側で適切に処理する。

| 対象ツール | 指定方法 |
|-----------|---------|
| `domain-create` | 日本語ドメインのまま指定可能 |
| 上記以外のドメイン操作 | Punycodeに変換して指定 |

ツールのdescriptionに「日本語ドメインの場合はPunycodeで指定してください」を記載する（`domain-create` を除く）。

## レスポンス形式

全ツール共通で MCP の `TextContent` 形式で返す:

```typescript
{
  content: [{
    type: "text",
    text: JSON.stringify(apiResponse, null, 2)
  }]
}
```

エラー時:

```typescript
{
  content: [{
    type: "text",
    text: JSON.stringify({ error: { code, message, errors } }, null, 2)
  }],
  isError: true
}
```
