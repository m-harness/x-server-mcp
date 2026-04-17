# PHPバージョン

## GET `/v1/server/{servername}/php-version` （読み取り）

### PHPバージョン設定を取得

選択可能なPHPバージョン一覧と、ドメインごとの現在のバージョンを返します。domain を指定すると、そのドメインの情報のみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/php-version" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `available_versions` | object | 選択可能なPHPバージョン。キーがバージョン番号、値が表示名称 |
| `domains[].domain` | string | ドメイン名 |
| `domains[].current_version` | string | 現在設定されているPHPバージョン |

### レスポンス例

```json
{
  "available_versions": ["8.0", "8.1", "8.2", "8.3"],
  "domains": [
    {
      "domain": "example.com",
      "current_version": "8.2"
    }
  ]
}
```

---

## PUT `/v1/server/{servername}/php-version/{domain}` （書き込み）

### PHPバージョンを変更

指定ドメインのPHPバージョンを変更します。

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `domain` | ドメイン名（日本語ドメインの場合はPunycodeで指定） |

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `version` | string | 必須 | PHPバージョン（例: 8.2） |

### リクエスト例

```bash
curl \
  -X PUT \
  "https://api.xserver.ne.jp/v1/server/{servername}/php-version/{domain}" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "version": "8.2"
}'
```

### レスポンス例

```json
{
  "message": "PHPバージョンを変更しました"
}
```
