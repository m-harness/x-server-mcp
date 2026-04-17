# ドメイン設定

## GET `/v1/server/{servername}/domain` （読み取り）

### ドメイン一覧を取得

サーバーに追加済みのドメインの一覧を返します。

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/domain" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `domains[].domain` | string | ドメイン名 |
| `domains[].type` | string | ドメイン種別（例: addon = 追加ドメイン） |
| `domains[].ssl` | boolean | SSL設定の有無 |
| `domains[].memo` | string | メモ |
| `domains[].is_awaiting` | boolean | ドメイン設定反映待ちかどうか |

### レスポンス例

```json
{
  "domains": [
    {
      "domain": "example.com",
      "type": "addon",
      "ssl": true,
      "memo": "",
      "is_awaiting": false
    }
  ]
}
```

---

## GET `/v1/server/{servername}/domain/{domain}` （読み取り）

### ドメイン詳細を取得

ドキュメントルート、PHPバージョン、SSL設定状況を含む詳細情報を返します。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `domain` | ドメイン名（日本語ドメインの場合はPunycodeで指定。URLエンコードすること） |

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `domain` | string | ドメイン名 |
| `type` | string | ドメイン種別（例: addon = 追加ドメイン） |
| `document_root` | string | ドキュメントルートの絶対パス |
| `url` | string | サイトURL（SSL設定時は https） |
| `php_version` | string | 現在のPHPバージョン（例: 8.3） |
| `ssl` | boolean | SSL証明書が設定されているかどうか |
| `memo` | string | メモ |
| `is_awaiting` | boolean | ドメイン設定反映待ちかどうか |
| `created_at` | string | 追加日 |

### レスポンス例

```json
{
  "domain": "example.com",
  "type": "addon",
  "document_root": "/home/xs123456/example.com/public_html",
  "url": "https://example.com/",
  "php_version": "8.3",
  "ssl": true,
  "memo": "",
  "is_awaiting": false,
  "created_at": "2024-01-15"
}
```

---

## POST `/v1/server/{servername}/domain` （書き込み）

### ドメインを追加

追加型ドメインをサーバーに追加します。追加時にドメイン所有権の確認（TXTレコード検証）が自動で実施されます。詳細は [共通仕様 > ドメイン所有権確認](./common.md#ドメイン所有権確認) を参照してください。ssl を true にすると無料SSLも設定されます。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 必須 | ドメイン名 |
| `ssl` | boolean | 任意 | SSL設定（デフォルト: true） |
| `redirect_https` | boolean | 任意 | HTTPS転送設定（デフォルト: ssl と同じ値） |
| `ai_crawler_block_enabled` | boolean | 任意 | AIクローラー遮断設定（デフォルト: true） |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/domain" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "domain": "example.com",
  "ssl": true,
  "redirect_https": true,
  "ai_crawler_block_enabled": true,
  "memo": ""
}'
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `domain` | string | 追加されたドメイン名 |
| `message` | string | 処理結果メッセージ |
| `ssl_status` | string | SSL設定結果（`success` / `failed` / `failed_nameserver`） |

### レスポンス例

```json
{
  "domain": "example.com",
  "message": "ドメインを追加しました",
  "ssl_status": "success"
}
```

---

## PUT `/v1/server/{servername}/domain/{domain}` （書き込み）

### ドメインのメモを更新

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `domain` | ドメイン名（日本語ドメインの場合はPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `memo` | string | 必須 | メモ |

### レスポンス例

```json
{
  "message": "ドメイン設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/domain/{domain}` （書き込み）

### ドメインを削除

ドメインを削除します。delete_files を true にすると、ユーザー公開領域のドメインディレクトリも合わせて削除します。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `domain` | ドメイン名（日本語ドメインの場合はPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `delete_files` | boolean | 任意 | ユーザー公開領域のドメインディレクトリも削除するか（デフォルト: false） |

### レスポンス例

```json
{
  "message": "ドメインを削除しました"
}
```

---

## POST `/v1/server/{servername}/domain/{domain}/reset` （書き込み）

### ドメイン設定を初期化

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `domain` | ドメイン名（日本語ドメインの場合はPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `type` | string | 必須 | リセット種別（`all`: 全初期化 / `web`: Web領域のみ初期化 / `other`: Web以外の設定を初期化） |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/domain/{domain}/reset" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "type": "all"
}'
```

### レスポンス例

```json
{
  "message": "ドメイン設定をリセットしました"
}
```
