# FTPアカウント

## GET `/v1/server/{servername}/ftp` （読み取り）

### FTPアカウント一覧を取得

登録済みFTPアカウントを一覧で返します。メインアカウントは含まれません。domain を指定すると、そのドメインのアカウントのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/ftp" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `accounts[].ftp_account` | string | FTPアカウント（user@domain 形式） |
| `accounts[].directory` | string | アクセス先ディレクトリ |
| `accounts[].quota_mb` | integer | 容量制限（MB。0 は無制限） |
| `accounts[].memo` | string | メモ |

### レスポンス例

```json
{
  "accounts": [
    {
      "ftp_account": "ftpuser@example.com",
      "directory": "example.com/public_html",
      "quota_mb": 5000,
      "memo": "開発用"
    }
  ]
}
```

---

## POST `/v1/server/{servername}/ftp` （書き込み）

### FTPアカウントを追加

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `ftp_account` | string | 必須 | FTPアカウント（user@domain 形式。例: ftpuser@example.com） |
| `password` | string | 必須 | パスワード（8文字以上） |
| `directory` | string | 任意 | ディレクトリ（デフォルト: /） |
| `quota_mb` | integer | 任意 | 容量(MB) |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/ftp" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ftp_account": "ftpuser@example.com",
  "password": "FtpPass123!",
  "directory": "/public_html",
  "quota_mb": 5000,
  "memo": "開発用"
}'
```

### レスポンス例

```json
{
  "ftp_account": "ftpuser@example.com",
  "message": "FTPアカウントを作成しました"
}
```

---

## PUT `/v1/server/{servername}/ftp/{ftp_account}` （書き込み）

### FTPアカウントを変更

送信した項目のみ更新され、省略した項目は現在の設定が維持されます。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `ftp_account` | FTPアカウント（user@domain 形式） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `password` | string | 任意 | パスワード |
| `directory` | string | 任意 | ディレクトリ |
| `quota_mb` | integer | 任意 | 容量(MB) |
| `memo` | string | 任意 | メモ |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/ftp/{ftp_account}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "password": "NewFtpPass456!",
  "directory": "/public_html",
  "quota_mb": 1000,
  "memo": "本番用"
}'
```

### レスポンス例

```json
{
  "message": "FTPアカウント設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/ftp/{ftp_account}` （書き込み）

### FTPアカウントを削除

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `ftp_account` | FTPアカウント |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/ftp/{ftp_account}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "FTPアカウントを削除しました"
}
```
