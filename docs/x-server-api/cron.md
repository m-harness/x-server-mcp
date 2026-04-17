# Cron設定

## GET `/v1/server/{servername}/cron` （読み取り）

### Cron一覧を取得

登録済みのCron設定を一覧で返します。各要素の id は PUT/DELETE で指定するハッシュIDです。

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/cron" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `crons[].id` | string | CronのハッシュID（PUT/DELETEで使用） |
| `crons[].minute` | string | 分（0-59, \*/5 等） |
| `crons[].hour` | string | 時（0-23, \* 等） |
| `crons[].day` | string | 日（1-31, \* 等） |
| `crons[].month` | string | 月（1-12, \* 等） |
| `crons[].weekday` | string | 曜日（0-7, \* 等） |
| `crons[].command` | string | 実行コマンド |
| `crons[].comment` | string | コメント |
| `crons[].enabled` | boolean | 有効/無効 |
| `notification_email` | string | Cron通知先メールアドレス |

### レスポンス例

```json
{
  "crons": [
    {
      "id": "a1b2c3d4e5",
      "minute": "*/5",
      "hour": "*",
      "day": "*",
      "month": "*",
      "weekday": "*",
      "command": "/usr/bin/php /home/user/cron.php",
      "comment": "5分毎のバッチ処理",
      "enabled": true
    }
  ],
  "notification_email": "admin@example.com"
}
```

---

## POST `/v1/server/{servername}/cron` （書き込み）

### Cronを新規追加

新しいCron設定を追加します。レスポンスの id は後続の PUT・DELETE で使用します。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `minute` | string | 必須 | 分（0-59, \*/5 等） |
| `hour` | string | 必須 | 時（0-23, \* 等） |
| `day` | string | 必須 | 日（1-31, \* 等） |
| `month` | string | 必須 | 月（1-12, \* 等） |
| `weekday` | string | 必須 | 曜日（0-7, \* 等） |
| `command` | string | 必須 | 実行コマンド（最大1024文字） |
| `comment` | string | 任意 | コメント |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/cron" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "minute": "*/5",
  "hour": "*",
  "day": "*",
  "month": "*",
  "weekday": "*",
  "command": "/usr/bin/php /home/user/cron.php",
  "comment": "5分毎のバッチ"
}'
```

### レスポンス例

```json
{
  "id": "a1b2c3d4e5",
  "message": "Cron設定を追加しました"
}
```

---

## PUT `/v1/server/{servername}/cron/{cron_id}` （書き込み）

### Cronを変更

既存のCron設定を変更します。送信した項目のみ更新され、省略した項目は現在の設定が維持されます。スケジュール・コマンド・コメントなどの内容を変更すると id が変わります。後続の PUT/DELETE ではレスポンスの新しい id を使用してください。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `cron_id` | CronのハッシュID（一覧取得で得られる id） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `minute` | string | 任意 | 分 |
| `hour` | string | 任意 | 時 |
| `day` | string | 任意 | 日 |
| `month` | string | 任意 | 月 |
| `weekday` | string | 任意 | 曜日 |
| `command` | string | 任意 | 実行コマンド |
| `comment` | string | 任意 | コメント |
| `enabled` | boolean | 任意 | 有効/無効（デフォルト: true） |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/cron/{cron_id}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "minute": "0",
  "hour": "3",
  "day": "*",
  "month": "*",
  "weekday": "*",
  "command": "/usr/bin/php /home/user/cron.php",
  "comment": "毎日3時のバッチ",
  "enabled": true
}'
```

### レスポンス例

```json
{
  "id": "a1b2c3d4e5",
  "message": "Cron設定を変更しました"
}
```

---

## DELETE `/v1/server/{servername}/cron/{cron_id}` （書き込み）

### Cronを削除

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `cron_id` | CronのハッシュID |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/cron/{cron_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "Cron設定を削除しました"
}
```
