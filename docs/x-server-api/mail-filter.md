# メール振り分け

## GET `/v1/server/{servername}/mail-filter` （読み取り）

### 振り分け設定一覧を取得

条件とアクションで定義された振り分けルールの一覧を返します。domain を指定すると、そのドメインのルールのみに絞り込めます。

### クエリパラメータ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 任意 | 絞り込み対象のドメイン（省略時は全ドメイン。日本語ドメインの場合はPunycodeで指定。サブドメインでの絞り込みには対応していません） |

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail-filter" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `filters[].id` | string | 振り分けルールのID（DELETEで使用） |
| `filters[].domain` | string | 対象ドメイン |
| `filters[].priority` | integer | ドメイン内での優先度（1から連番。番号が小さいほど先に評価される） |
| `filters[].conditions` | object[] | 条件の配列。複数条件はすべてANDで評価される |
| `filters[].conditions[].keyword` | string | マッチさせるキーワード |
| `filters[].conditions[].field` | string | 対象フィールド（`subject` / `from` / `to` / `body` / `header`） |
| `filters[].conditions[].match_type` | string | 一致条件（`contain` / `match` / `start_from`） |
| `filters[].action` | object | 振り分けアクション |
| `filters[].action.type` | string | 転送先種別（`mail_address` / `spam_folder` / `trash` / `delete`） |
| `filters[].action.target` | string | 転送先メールアドレス。type が mail_address の場合に値が入り、それ以外では空文字 |
| `filters[].action.method` | string | 処理方法（`move`: 転送 / `copy`: コピー転送） |

### field の値

| 値 | 意味 |
|---|------|
| `subject` | 件名 |
| `from` | 差出人 |
| `to` | あて先 |
| `body` | 本文 |
| `header` | ヘッダー全体 |

### match_type の値

| 値 | 意味 |
|---|------|
| `contain` | キーワードを含む |
| `match` | キーワードと完全一致 |
| `start_from` | キーワードから始まる |

### action.type の値

| 値 | 意味 |
|---|------|
| `mail_address` | 指定メールアドレスに転送 |
| `spam_folder` | 迷惑メールフォルダに振り分け |
| `trash` | ゴミ箱に振り分け |
| `delete` | メールを削除 |

### action.method の値

| 値 | 意味 |
|---|------|
| `move` | 転送（元のメールボックスには残さない） |
| `copy` | コピー転送（元のメールボックスにも残す） |

### レスポンス例

```json
{
  "filters": [
    {
      "id": "f1a2b3c4",
      "domain": "example.com",
      "priority": 1,
      "conditions": [
        {
          "keyword": "aaa",
          "field": "from",
          "match_type": "match"
        }
      ],
      "action": {
        "type": "spam_folder",
        "target": "",
        "method": "copy"
      }
    }
  ]
}
```

---

## POST `/v1/server/{servername}/mail-filter` （書き込み）

### 振り分け設定を追加

条件を1つ以上、アクションを必須で指定します。複数条件はすべてANDで評価されます。

### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `domain` | string | 必須 | ドメイン（最大253文字。日本語ドメインの場合はPunycodeで指定） |
| `conditions[].keyword` | string | 必須 | マッチさせるキーワード |
| `conditions[].field` | string | 必須 | 対象フィールド（`subject` / `from` / `to` / `body` / `header`） |
| `conditions[].match_type` | string | 必須 | 一致条件（`contain` / `match` / `start_from`） |
| `action.type` | string | 必須 | 転送先種別（`mail_address` / `spam_folder` / `trash` / `delete`） |
| `action.target` | string | 任意 | 転送先メールアドレス。type が mail_address の場合に指定 |
| `action.method` | string | 必須 | 処理方法（`move` / `copy`） |

### レスポンス例

```json
{
  "id": "f1a2b3c4",
  "message": "メール振り分けルールを追加しました"
}
```

---

## DELETE `/v1/server/{servername}/mail-filter/{filter_id}` （書き込み）

### 振り分け設定を削除

### パスパラメータ

| 名前 | 説明 |
| --- | --- |
| `filter_id` | 振り分けルールのID（一覧取得で得られる id） |

### リクエスト例

```bash
curl \
  -X DELETE \
  "https://api.xserver.ne.jp/v1/server/{servername}/mail-filter/{filter_id}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンス例

```json
{
  "message": "メール振り分けルールを削除しました"
}
```
