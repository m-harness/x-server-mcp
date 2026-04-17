# メールアカウント

## GET `/v1/server/{servername}/mail` （読み取り）

### メールアカウント一覧を取得

サーバーに登録済みのメールアカウントを一覧で返します。domain を指定すると、そのドメインのアカウントのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `accounts[].mail_address` | string | メールアドレス |
| `accounts[].quota_mb` | integer | メールボックス容量（MB） |
| `accounts[].memo` | string | メモ |

### レスポンス例

```json
{
  "accounts": [
    {
      "mail_address": "info@example.com",
      "quota_mb": 2000,
      "memo": "問い合わせ用"
    }
  ]
}
```

---

## GET `/v1/server/{servername}/mail/{mail_account}` （読み取り）

### メールアカウント詳細を取得

指定したメールアカウントの詳細情報（容量・使用量を含む）を返します。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `mail_account` | メールアドレス（例: user@example.com）。URLエンコードすること |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail/{mail_account}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `mail_address` | string | メールアドレス |
| `quota_mb` | integer | メールボックス容量上限（MB） |
| `used_mb` | number | メールボックス使用量（MB） |
| `memo` | string | メモ |

### レスポンス例

```json
{
  "mail_address": "info@example.com",
  "quota_mb": 2000,
  "used_mb": 12.5,
  "memo": "問い合わせ用"
}
```

---

## POST `/v1/server/{servername}/mail` （書き込み）

### メールアカウントを作成

メールアカウントを作成します。作成時にドメイン所有権の確認（TXTレコード検証）が自動で実施されます。詳細は [共通仕様 > ドメイン所有権確認](./common.md#ドメイン所有権確認) を参照してください。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `mail_address` | string | 必須 | メールアドレス |
| `password` | string | 必須 | パスワード（6文字以上） |
| `quota_mb` | integer | 任意 | 容量(MB) 1-50000 |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "mail_address": "info@example.com",
  "password": "SecurePass123",
  "quota_mb": 2000,
  "memo": "問い合わせ用"
}'
```

### レスポンス例

```json
{
  "mail_address": "info@example.com",
  "message": "メールアカウントを作成しました"
}
```

---

## PUT `/v1/server/{servername}/mail/{mail_account}` （書き込み）

### メールアカウントを変更

送信した項目のみ更新され、省略した項目は現在の設定が維持されます。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `mail_account` | メールアドレス |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `password` | string | 任意 | パスワード |
| `quota_mb` | integer | 任意 | 容量(MB) |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail/{mail_account}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "password": "NewPass456",
  "quota_mb": 3000,
  "memo": "営業部用"
}'
```

### レスポンス例

```json
{
  "message": "メールアカウント設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/mail/{mail_account}` （書き込み）

### メールアカウントを削除

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `mail_account` | メールアドレス |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail/{mail_account}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "メールアカウントを削除しました"
}
```

---

## GET `/v1/server/{servername}/mail/{mail_account}/forwarding` （読み取り）

### メール転送設定を取得

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `mail_account` | メールアドレス |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail/{mail_account}/forwarding" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `forwarding_addresses` | string[] | 転送先メールアドレスの配列 |
| `keep_in_mailbox` | boolean | 転送後もメールボックスに残すかどうか |

### レスポンス例

```json
{
  "forwarding_addresses": [
    "forward1@example.com",
    "forward2@example.com"
  ],
  "keep_in_mailbox": true
}
```

---

## PUT `/v1/server/{servername}/mail/{mail_account}/forwarding` （書き込み）

### メール転送設定を更新

転送先アドレスは上書きで設定されます。空配列を送ると転送先をクリアできます。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `mail_account` | メールアドレス |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `forwarding_addresses` | array | 任意 | 転送先メールアドレスの配列 |
| `keep_in_mailbox` | boolean | 任意 | 転送後もメールボックスに残すか |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail/{mail_account}/forwarding" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "forwarding_addresses": [
    "forward@example.com"
  ],
  "keep_in_mailbox": true
}'
```

### レスポンス例

```json
{
  "message": "メール転送設定を変更しました"
}
```
