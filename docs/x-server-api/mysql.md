# MySQL

## データベース

### GET `/v1/server/{servername}/db` （読み取り）

#### データベース一覧を取得

MySQLデータベースの一覧を返します。

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/db" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `databases[].db_name` | string | データベース名 |
| `databases[].version_name` | string | バージョン表示名（例: MariaDB10.5） |
| `databases[].size_mb` | number | データベースサイズ（MB） |
| `databases[].granted_users` | array | アクセス権限を持つMySQLユーザー名の配列 |
| `databases[].memo` | string | メモ |

#### レスポンス例

```json
{
  "databases": [
    {
      "db_name": "xs123456_db01",
      "version_name": "MariaDB10.5",
      "size_mb": 128.5,
      "granted_users": ["xs123456_user01"],
      "memo": "本番用DB"
    }
  ]
}
```

---

### POST `/v1/server/{servername}/db` （書き込み）

#### データベースを作成

#### リクエストボディ

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name_suffix` | string | 必須 | データベース名のサフィックス（サーバーID\_に続く部分、例: db01 → xs123456\_db01） |
| `character_set` | string | 任意 | 文字コード（省略時 utf8mb4）。`utf8mb4` / `UTF-8` / `EUC-JP` / `SHIFT-JIS` / `Binary` |
| `memo` | string | 任意 | メモ |

#### リクエスト例

```bash
curl \
  -X POST \
  "https://api.xserver.ne.jp/v1/server/{servername}/db" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name_suffix": "db01",
  "character_set": "utf8mb4",
  "memo": "本番用DB"
}'
```

#### レスポンス例

```json
{
  "db_name": "xs123456_db01",
  "message": "データベースを作成しました"
}
```

---

### PUT `/v1/server/{servername}/db/{db_name}` （書き込み）

#### データベースのメモを更新

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `memo` | string | 必須 | メモ |

#### レスポンス例

```json
{
  "message": "データベース設定を変更しました"
}
```

---

### DELETE `/v1/server/{servername}/db/{db_name}` （書き込み）

#### データベースを削除

#### レスポンス例

```json
{
  "message": "データベースを削除しました"
}
```

---

## MySQLユーザー

### GET `/v1/server/{servername}/db/user` （読み取り）

#### MySQLユーザー一覧を取得

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `users[].db_user` | string | MySQLユーザー名 |
| `users[].version_name` | string | バージョン表示名 |
| `users[].memo` | string | メモ |

#### レスポンス例

```json
{
  "users": [
    {
      "db_user": "xs123456_user01",
      "version_name": "MariaDB10.5",
      "memo": "WP用ユーザー"
    }
  ]
}
```

---

### POST `/v1/server/{servername}/db/user` （書き込み）

#### MySQLユーザーを作成

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `name_suffix` | string | 必須 | ユーザー名のサフィックス（サーバーID\_に続く部分、例: user01 → xs123456\_user01） |
| `password` | string | 必須 | パスワード（6文字以上） |
| `memo` | string | 任意 | メモ |

#### レスポンス例

```json
{
  "db_user": "xs123456_user01",
  "message": "MySQLユーザーを作成しました"
}
```

---

### PUT `/v1/server/{servername}/db/user/{db_user}` （書き込み）

#### MySQLユーザーを変更

送信した項目のみ更新され、省略した項目は現在の設定が維持されます。

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `password` | string | 任意 | パスワード |
| `memo` | string | 任意 | メモ |

#### レスポンス例

```json
{
  "message": "MySQLユーザー設定を変更しました"
}
```

---

### DELETE `/v1/server/{servername}/db/user/{db_user}` （書き込み）

#### MySQLユーザーを削除

#### レスポンス例

```json
{
  "message": "MySQLユーザーを削除しました"
}
```

---

## データベース権限

### GET `/v1/server/{servername}/db/user/{db_user}/grant` （読み取り）

#### データベース権限を取得

指定したMySQLユーザーがアクセス権限を持つデータベースの一覧を返します。

#### レスポンス例

```json
{
  "databases": [
    "xs123456_db01",
    "xs123456_db02"
  ]
}
```

---

### POST `/v1/server/{servername}/db/user/{db_user}/grant` （書き込み）

#### データベース権限を付与

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `db_name` | string | 必須 | データベース名 |

#### レスポンス例

```json
{
  "message": "権限を付与しました"
}
```

---

### DELETE `/v1/server/{servername}/db/user/{db_user}/grant` （書き込み）

#### データベース権限を削除

指定したMySQLユーザーからデータベースへのアクセス権限を削除します。

| 名前 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `db_name` | string | 必須 | データベース名 |

#### レスポンス例

```json
{
  "message": "権限を削除しました"
}
```
