# ログ

## アクセスログ

### GET `/v1/server/{servername}/access-log` （読み取り）

#### アクセスログを取得

指定ドメインのアクセスログを取得します。lines で末尾からの取得行数、keyword で絞り込みが可能です。

#### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 必須 | ドメイン（日本語ドメインの場合はPunycodeで指定） |
| `lines` | integer | 任意 | 取得行数（末尾から。省略時は全件） |
| `keyword` | string | 任意 | 絞り込みキーワード |

#### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/access-log?domain=VALUE" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `domain` | string | 対象ドメイン |
| `log` | string | アクセスログ本文（改行区切り） |

#### レスポンス例

```json
{
  "domain": "example.com",
  "log": "123.45.67.89 - - [15/Jan/2024:10:30:00 +0900] \"GET / HTTP/1.1\" 200 1234\n..."
}
```

---

## エラーログ

### GET `/v1/server/{servername}/error-log` （読み取り）

#### エラーログを取得

指定ドメインのエラーログを取得します。lines で末尾からの取得行数、keyword で絞り込みが可能です。

#### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 必須 | ドメイン（日本語ドメインの場合はPunycodeで指定） |
| `lines` | integer | 任意 | 取得行数（末尾から） |
| `keyword` | string | 任意 | 絞り込みキーワード |

#### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/error-log?domain=VALUE" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `domain` | string | 対象ドメイン |
| `log` | string | エラーログ本文（改行区切り） |

#### レスポンス例

```json
{
  "domain": "example.com",
  "log": "[Mon Jan 15 10:30:00.123456 2024] [php:error] ...\n..."
}
```
