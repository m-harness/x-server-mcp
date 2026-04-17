# SSL設定

## GET `/v1/server/{servername}/ssl` （読み取り）

### SSL設定一覧を取得

無料SSL（Let's Encrypt）およびオプションSSLの一覧を返します。domain を指定すると、そのドメインの証明書のみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/ssl" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `ssl_list[].id` | integer | SSL設定のID |
| `ssl_list[].common_name` | string | コモンネーム（ドメイン名） |
| `ssl_list[].type` | string | 証明書種別（`letsencrypt`: 無料SSL / `option`: オプション独自SSL） |
| `ssl_list[].expires_at` | string | 有効期限（ISO 8601形式） |
| `ssl_list[].status` | string | 状態（`active`: 有効 / `expired`: 期限切れ） |

### レスポンス例

```json
{
  "ssl_list": [
    {
      "id": 1,
      "common_name": "example.com",
      "type": "letsencrypt",
      "expires_at": "2024-12-31T23:59:59+09:00",
      "status": "active"
    }
  ]
}
```

---

## POST `/v1/server/{servername}/ssl` （書き込み）

### 無料SSLをインストール

指定ドメインに対して無料SSL証明書（Let's Encrypt）を発行・インストールします。対象ドメインのネームサーバーが当社ネームサーバーの場合のみ利用可能です。外部ネームサーバーを利用中の場合はサーバーパネルから操作してください。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `common_name` | string | 必須 | コモンネーム（ドメイン名。日本語ドメインの場合はPunycodeで指定） |

### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/ssl" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "common_name": "example.com"
}'
```

### レスポンス例

```json
{
  "message": "無料SSLを設定しました"
}
```

---

## DELETE `/v1/server/{servername}/ssl/{common_name}` （書き込み）

### 無料SSLをアンインストール

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `common_name` | Common Name（日本語ドメインの場合はPunycodeで指定） |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/ssl/{common_name}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "無料SSLを削除しました"
}
```
