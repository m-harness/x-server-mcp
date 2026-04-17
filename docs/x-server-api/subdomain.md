# サブドメイン

## GET `/v1/server/{servername}/subdomain` （読み取り）

### サブドメイン一覧を取得

登録済みサブドメインの一覧を返します。domain を指定すると、その親ドメインのサブドメインのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象の親ドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/subdomain" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `subdomains[].subdomain` | string | サブドメイン名（FQDN 形式。例: blog.example.com） |
| `subdomains[].domain` | string | 親ドメイン名 |
| `subdomains[].document_root` | string | ドキュメントルートのパス |
| `subdomains[].ssl` | boolean | SSL設定の有無 |
| `subdomains[].memo` | string | メモ |

### レスポンス例

```json
{
  "subdomains": [
    {
      "subdomain": "blog.example.com",
      "domain": "example.com",
      "document_root": "/home/xs123456/blog.example.com/public_html",
      "ssl": true,
      "memo": "ブログ用"
    }
  ]
}
```

---

## POST `/v1/server/{servername}/subdomain` （書き込み）

### サブドメインを追加

短時間に連続して作成すると、一時的にエラーが返る場合があります。間隔をあけて再試行してください。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `subdomain` | string | 必須 | サブドメイン（例: blog.example.com）。日本語ドメインの場合はドメイン部分をPunycodeで指定 |
| `ssl` | boolean | 任意 | SSL設定（デフォルト: true） |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/subdomain" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "subdomain": "blog.example.com",
  "ssl": true,
  "memo": "ブログ用"
}'
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `subdomain` | string | 追加されたサブドメイン（FQDN 形式） |
| `message` | string | 処理結果メッセージ |
| `ssl_status` | string | SSL設定結果（`success` / `failed` / `failed_nameserver`） |

### レスポンス例

```json
{
  "subdomain": "blog.example.com",
  "message": "サブドメインを追加しました",
  "ssl_status": "success"
}
```

---

## PUT `/v1/server/{servername}/subdomain/{subdomain}` （書き込み）

### サブドメインのメモを更新

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `subdomain` | サブドメイン（日本語ドメインの場合はドメイン部分をPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `memo` | string | 必須 | メモ |

### レスポンス例

```json
{
  "message": "サブドメイン設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/subdomain/{subdomain}` （書き込み）

### サブドメインを削除

サブドメインを削除します。delete_files を true にすると、ユーザー公開領域のサブドメインディレクトリも合わせて削除します。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `subdomain` | サブドメイン（日本語ドメインの場合はドメイン部分をPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `delete_files` | boolean | 任意 | ユーザー公開領域のサブドメインディレクトリも削除するか（デフォルト: false） |

### レスポンス例

```json
{
  "message": "サブドメインを削除しました"
}
```
