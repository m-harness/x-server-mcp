# サーバー情報

## GET `/v1/server/{servername}/server-info` （読み取り）

### サーバー情報を取得

サーバーのスペック・ソフトウェアバージョン・ネームサーバーなどの基本情報を返します。サーバーパネルの「サーバー情報」画面に相当します。

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/server-info" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `server_id` | string | サーバーID（例: xs123456） |
| `hostname` | string | ホスト名（例: sv12345.xserver.jp） |
| `ip_address` | string | IPアドレス |
| `os` | string | OS名（例: Linux） |
| `cpu` | string\|null | CPU情報。XServerビジネスのサブアカウントでは null |
| `memory` | string\|null | メモリ容量（例: 1024GB）。XServerビジネスのサブアカウントでは null |
| `apache_version` | string | Apacheバージョン（パッチ番号は x 表記。例: 2.4.x） |
| `perl_versions` | string[] | 利用可能なPerlバージョンの配列 |
| `php_versions` | string[] | 利用可能なPHPバージョンの配列（PHP8→PHP7→PHP5→PHP4 の順） |
| `db_versions` | string[] | 利用可能なDB製品＋バージョンの配列（例: mariadb10.5.x） |
| `name_servers` | string[] | ネームサーバーの配列（通常 ns1〜ns5） |
| `domain_validation_token` | string | ドメイン追加時の所有権確認用トークン |

### レスポンス例

```json
{
  "server_id": "xs123456",
  "hostname": "sv12345.xserver.jp",
  "ip_address": "123.45.67.89",
  "os": "Linux",
  "cpu": "AMD EPYC 9534( 2.45GHz ) x 2",
  "memory": "1536GB",
  "apache_version": "2.4.x",
  "perl_versions": ["5.26", "5.16"],
  "php_versions": ["8.5.2", "8.4.12", "8.3.21", "8.2.28", "7.4.33", "7.3.33"],
  "db_versions": ["mariadb10.5.x"],
  "name_servers": ["ns1.xserver.jp", "ns2.xserver.jp", "ns3.xserver.jp", "ns4.xserver.jp", "ns5.xserver.jp"],
  "domain_validation_token": "a1b2c3d4e5f6..."
}
```

---

## GET `/v1/server/{servername}/server-info/usage` （読み取り）

### サーバー利用状況を取得

ディスク使用量・ファイル数・各種設定件数を返します。サーバーパネルのトップページに表示される利用状況に相当します。

### リクエスト例

```bash
curl \
  "https://api.xserver.ne.jp/v1/server/{servername}/server-info/usage" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### レスポンスフィールド

| 名前 | 型 | 説明 |
| --- | --- | --- |
| `disk.quota_gb` | number | ディスク容量の上限（GB） |
| `disk.used_gb` | number | ディスク使用量（GB） |
| `disk.file_limit` | integer | ファイル数の上限（0 の場合は無制限） |
| `disk.file_count` | integer | 現在のファイル数 |
| `counts.domains` | integer | ドメイン設定数（初期ドメインを除く） |
| `counts.subdomains` | integer | サブドメイン設定数 |
| `counts.mail_accounts` | integer | メールアカウント数 |
| `counts.ftp_accounts` | integer | FTPアカウント数（メインアカウントを除く追加分） |
| `counts.mysql_databases` | integer | MySQLデータベース数 |

### レスポンス例

```json
{
  "disk": {
    "quota_gb": 500,
    "used_gb": 0.67,
    "file_limit": 0,
    "file_count": 12345
  },
  "counts": {
    "domains": 3,
    "subdomains": 2,
    "mail_accounts": 5,
    "ftp_accounts": 2,
    "mysql_databases": 4
  }
}
```
