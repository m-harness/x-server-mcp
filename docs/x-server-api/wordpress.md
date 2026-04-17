# WordPress簡単インストール

## GET `/v1/server/{servername}/wp` （読み取り）

### WordPress一覧を取得

簡単インストールでインストール済みのWordPress一覧を返します。domain を指定すると、そのドメインのインストールのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/wp" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `wordpress[].id` | string | WordPressのハッシュID（PUT/DELETEで使用） |
| `wordpress[].domain` | string | 親ドメイン |
| `wordpress[].url` | string | インストール先URL |
| `wordpress[].title` | string | サイトのタイトル |
| `wordpress[].version` | string | WordPressバージョン |
| `wordpress[].db_name` | string | 使用しているデータベース名 |
| `wordpress[].db_user` | string | 使用しているデータベースユーザー名 |
| `wordpress[].memo` | string | メモ |

### レスポンス例

```json
{
  "wordpress": [
    {
      "id": "a1b2c3d4e5f6g7h8",
      "domain": "example.com",
      "url": "http://example.com/blog",
      "title": "My Blog",
      "version": "6.4.2",
      "db_name": "xs123456_db01",
      "db_user": "xs123456_user01",
      "memo": "ブログ用"
    }
  ]
}
```

---

## POST `/v1/server/{servername}/wp` （書き込み）

### WordPressを新規インストール

指定URLにWordPressを簡単インストールします。URLにはドメインまたはサブドメインを指定でき、パス付きも可能です。スキーム（https:// 等）は省略できます。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `url` | string | 必須 | インストール先URL（最大512文字）。スキーム省略可 |
| `title` | string | 必須 | サイトタイトル（最大255文字） |
| `admin_username` | string | 必須 | 管理者ユーザー名（最大255文字） |
| `admin_password` | string | 必須 | 管理者パスワード（7文字以上） |
| `admin_email` | string | 必須 | 管理者メールアドレス（最大255文字） |
| `memo` | string | 任意 | メモ（最大500文字） |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/wp" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "url": "https://example.com/blog",
  "title": "My Blog",
  "admin_username": "admin",
  "admin_password": "SecurePass123",
  "admin_email": "admin@example.com",
  "memo": "ブログ用WP"
}'
```

### レスポンス例

```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "message": "WordPressをインストールしました"
}
```

---

## PUT `/v1/server/{servername}/wp/{wp_id}` （書き込み）

### WordPress設定を変更

現在変更可能な項目はメモのみです。省略した場合はメモが空に更新されます。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `wp_id` | WordPressのID（一覧取得で得られる id） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `memo` | string | 任意 | メモ（省略時は空文字に更新） |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/wp/{wp_id}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "memo": "ブログ用WP"
}'
```

### レスポンス例

```json
{
  "message": "WordPress設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/wp/{wp_id}` （書き込み）

### WordPressを削除

WordPressをアンインストールします。関連するデータベース・ユーザー・Cronの削除はオプションで制御できます。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `wp_id` | WordPressのID |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `delete_db` | boolean | 任意 | 関連するMySQLデータベースも削除するか（デフォルト: true） |
| `delete_db_user` | boolean | 任意 | 関連するMySQLユーザーも削除するか（デフォルト: false） |
| `delete_cron` | boolean | 任意 | キャッシュ自動削除Cronも削除するか（デフォルト: true） |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/wp/{wp_id}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "delete_db": true,
  "delete_db_user": false,
  "delete_cron": true
}'
```

### レスポンス例

```json
{
  "message": "WordPressを削除しました"
}
```
