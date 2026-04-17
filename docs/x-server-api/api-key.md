# APIキー情報

## GET `/v1/me` （読み取り）

### 認証中のAPIキー情報を取得

現在認証に使用しているAPIキーの情報を返します。有効期限・紐づくサーバー名・権限種別を確認できます。

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/me" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `service_type` | string | APIキーのサービス種別（server） |
| `expires_at` | string\|null | 有効期限（ISO 8601形式）。無期限の場合は null |
| `servername` | string | 紐づくサーバー名（初期ドメイン） |
| `permission_type` | string | 権限種別（full / read / custom） |

### レスポンス例

```json
{
  "service_type": "server",
  "expires_at": "2027-04-16T00:00:00",
  "servername": "xs123456.xsrv.jp",
  "permission_type": "full"
}
```
