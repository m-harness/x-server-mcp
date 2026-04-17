# DNSレコード

## GET `/v1/server/{servername}/dns` （読み取り）

### DNSレコード一覧を取得

ドメインに登録されたDNSレコードを一覧で返します。domain を指定すると、そのドメインのレコードのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/dns" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `records[].id` | integer | DNSレコードID（PUT/DELETEで使用） |
| `records[].domain` | string | 対象ドメイン |
| `records[].host` | string | ホスト名（@ は apex） |
| `records[].type` | string | レコードタイプ（`A` / `AAAA` / `CNAME` / `MX` / `TXT` / `SRV` / `CAA`） |
| `records[].content` | string | レコードの値 |
| `records[].ttl` | integer | TTL（秒） |
| `records[].priority` | integer | MX/SRVレコードの優先度。それ以外のレコードでは 0 |

### レスポンス例

```json
{
  "records": [
    {
      "id": 12345,
      "domain": "example.com",
      "host": "@",
      "type": "A",
      "content": "123.45.67.89",
      "ttl": 3600,
      "priority": null
    }
  ]
}
```

---

## POST `/v1/server/{servername}/dns` （書き込み）

### DNSレコードを追加

A, AAAA, CNAME, MX, TXT 等のレコードを追加します。MX の場合は priority を指定できます。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 必須 | ドメイン（最大253文字。日本語ドメインの場合はPunycodeで指定） |
| `host` | string | 必須 | ホスト名（@ で apex、最大255文字） |
| `type` | string | 必須 | レコードタイプ（`A` / `AAAA` / `CNAME` / `MX` / `TXT` / `SRV` / `CAA`） |
| `content` | string | 必須 | 内容 |
| `ttl` | integer | 任意 | TTL（60-86400。省略時 3600） |
| `priority` | integer | 任意 | MX レコードの優先度 |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/dns" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "domain": "example.com",
  "host": "www",
  "type": "A",
  "content": "192.0.2.1",
  "ttl": 3600,
  "priority": 10
}'
```

### レスポンス例

```json
{
  "id": 12346,
  "message": "DNSレコードを追加しました"
}
```

---

## PUT `/v1/server/{servername}/dns/{dns_id}` （書き込み）

### DNSレコードを更新

送信した項目のみ更新され、省略した項目は現在の設定が維持されます。レコードを自動解決できない場合は domain, host, type, content の指定が必要です。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `dns_id` | DNSレコードID |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | ドメイン（日本語ドメインの場合はPunycodeで指定） |
| `host` | string | 任意 | ホスト名 |
| `type` | string | 任意 | レコードタイプ |
| `content` | string | 任意 | 内容 |
| `ttl` | integer | 任意 | TTL（60-86400） |
| `priority` | integer | 任意 | MXレコードの優先度（省略時は現在の設定を維持） |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/dns/{dns_id}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "domain": "example.com",
  "host": "www",
  "type": "A",
  "content": "192.0.2.1",
  "ttl": 3600,
  "priority": 10
}'
```

### レスポンス例

```json
{
  "message": "DNSレコードを変更しました"
}
```

---

## DELETE `/v1/server/{servername}/dns/{dns_id}` （書き込み）

### DNSレコードを削除

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `dns_id` | DNSレコードID |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/dns/{dns_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "DNSレコードを削除しました"
}
```
