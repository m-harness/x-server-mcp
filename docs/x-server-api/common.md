# 共通仕様

## 認証

すべてのリクエストで `Authorization` ヘッダーに Bearer トークン（APIキー）を付与してください。

```
Authorization: Bearer xs_xxxxxxxxxxxx...
```

APIキーはXServerアカウント（契約管理画面）の「APIキー管理」から発行できます。キー名・有効期限・対象サーバーアカウント・権限を設定できます。

APIキーの発行手順については、下記マニュアルをご参照ください。

- [エックスサーバー — API設定マニュアル](https://www.xserver.ne.jp/manual/man_tool_api.php)
- [XServerビジネス — API設定マニュアル](https://support.xserver.ne.jp/manual/man_tool_api.php)

### 権限（スコープ）

APIキー発行時に設定する権限によって、利用可能なAPIが異なります。各エンドポイントに表示されている必要な権限を確認してください。

| APIキーの権限 | 利用可能なAPI |
| --- | --- |
| すべての操作 | 読み取り + 書き込み のすべてのAPI |
| 読み取り専用 | 読み取り のAPIのみ |
| カスタム | 個別に選択した権限に応じたAPI |

## レート制限

レスポンスヘッダーでレート制限情報が返されます。

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709654400
X-RateLimit-Concurrent-Limit: 5
X-RateLimit-Concurrent-Remaining: 4
```

制限超過時は HTTP 429 と `Retry-After` ヘッダーが返されます。同時リクエスト数が上限を超えた場合も HTTP 429 が返されます。

| プラン | リクエスト/分 | リクエスト/日 | 同時接続数 |
| --- | --- | --- | --- |
| エックスサーバー スタンダード | 60 | 10,000 | 5 |
| エックスサーバー プレミアム | 120 | 30,000 | 10 |
| エックスサーバー ビジネス / XServerビジネス 全プラン | 300 | 100,000 | 20 |

## HTTPステータスコード

### 成功時

| ステータス | 意味 | 対象 |
| --- | --- | --- |
| `200` | OK | すべてのリクエスト（GET / POST / PUT / DELETE） |

### エラー時

エラー時は以下の形式のJSONが返されます。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が正しくありません",
    "errors": [
      "エラーメッセージ1",
      "エラーメッセージ2"
    ]
  }
}
```

| ステータス | 意味 | 説明 |
| --- | --- | --- |
| `400` | Bad Request | リクエストが不正 |
| `401` | Unauthorized | 認証エラー（APIキーが無効・期限切れ） |
| `403` | Forbidden | 権限不足（スコープ不足・IP制限等） |
| `404` | Not Found | リソースまたはエンドポイントが見つからない |
| `409` | Conflict | サーバー側の制約により操作を完了できなかった |
| `422` | Unprocessable Entity | バリデーションエラー |
| `429` | Too Many Requests | レート制限超過 |
| `500` | Internal Server Error | サーバー内部エラー |
| `502` | Bad Gateway | バックエンドとの通信でエラーが発生 |

### エラーコード一覧

| コード | HTTP | 説明 |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | APIキーが未指定・無効・期限切れ |
| `FORBIDDEN` | 403 | APIキーの権限不足またはIP制限 |
| `NOT_FOUND` | 404 | 指定したリソース（ID・アカウント等）が存在しない |
| `OPERATION_ERROR` | 409 | リクエストは有効だが、サーバー側の制約により操作を完了できなかった。`message` に原因が含まれます |
| `VALIDATION_ERROR` | 422 | 入力値のバリデーションエラー。`errors` 配列にメッセージが含まれます |
| `RATE_LIMIT_EXCEEDED` | 429 | 分あたり・日あたりのリクエスト上限を超過。`Retry-After` ヘッダーで待機秒数を確認できます |
| `INTERNAL_ERROR` | 500 | API内部で予期しないエラーが発生 |
| `BACKEND_ERROR` | 502 | バックエンドとの通信・応答処理でエラーが発生。時間をおいて再試行してください |

## サーバー名（servername）について

APIのURLパスに含まれる `{servername}` には、サーバーの**初期ドメイン**を指定してください。

| サービス | 初期ドメインの形式 |
| --- | --- |
| エックスサーバー | `サーバーID.xsrv.jp` |
| XServerビジネス | `サーバーID.xbiz.jp` |

```
GET /v1/server/xs123456.xsrv.jp/server-info
```

## ドメイン所有権確認

一部のAPIでは、操作対象ドメインの所有権確認として `_xserver-verify.{domain}` の TXT レコード検証が自動で実施されます。

事前に以下の手順で TXT レコードを設定してください。

1. サーバー情報取得API（`GET /v1/server/{servername}/server-info`）を実行し、レスポンスの `domain_validation_token` を取得する
2. 対象ドメインの DNS に TXT レコードを追加する
   - ホスト名: `_xserver-verify.{domain}`
   - 値: `xserver-verify={取得したトークン}`
3. DNS の反映を待ってから対象APIを実行する

所有権確認が必要なAPI:

- ドメイン追加（`POST /v1/server/{servername}/domain`）
- メールアカウント作成（`POST /v1/server/{servername}/mail`）

## 日本語ドメインについて

日本語ドメイン（国際化ドメイン名）を指定する場合、APIによって指定方法が異なります。

| API | 指定方法 |
| --- | --- |
| ドメイン追加（`POST /domain`） | 日本語ドメインのまま指定可能（例: `日本語.jp`） |
| 上記以外のドメイン操作 | Punycode に変換して指定（例: `xn--wgv71a309e.jp`） |

パスパラメータ・クエリパラメータ・リクエストボディのいずれでドメインを指定する場合も同様です。サブドメインの場合はドメイン部分を Punycode に変換してください（例: `blog.xn--wgv71a309e.jp`）。
