# XServer API リファレンス

XServer API は、エックスサーバー・XServerビジネスのサーバーパネルで提供している主要機能を REST API で利用するためのインターフェースです。


| 項目      | 値                           |
| ------- | --------------------------- |
| ベースURL  | `https://api.xserver.ne.jp` |
| ベースパス   | `/v1/server/{servername}`   |
| プロトコル   | HTTPS                       |
| レスポンス形式 | JSON                        |


## 目次


| #   | セクション                               | ファイル             | 概要                                   |
| --- | ----------------------------------- | ---------------- | ------------------------------------ |
| 1   | [共通仕様](./common.md)                 | `common.md`      | 認証・レート制限・エラーハンドリング・ドメイン所有権確認・日本語ドメイン |
| 2   | [APIキー情報](./api-key.md)             | `api-key.md`     | `GET /v1/me`                         |
| 3   | [サーバー情報](./server-info.md)          | `server-info.md` | サーバースペック・利用状況の取得                     |
| 4   | [Cron設定](./cron.md)                 | `cron.md`        | Cron の一覧取得・追加・変更・削除                  |
| 5   | [WordPress簡単インストール](./wordpress.md) | `wordpress.md`   | WordPress の一覧取得・インストール・設定変更・削除       |
| 6   | [メールアカウント](./mail.md)               | `mail.md`        | メールアカウントの CRUD・転送設定                  |
| 7   | [メール振り分け](./mail-filter.md)         | `mail-filter.md` | メール振り分けルールの一覧取得・追加・削除                |
| 8   | [FTPアカウント](./ftp.md)                | `ftp.md`         | FTPアカウントの CRUD                       |
| 9   | [MySQL](./mysql.md)                 | `mysql.md`       | データベース・ユーザー・権限の CRUD                 |
| 10  | [PHPバージョン](./php-version.md)        | `php-version.md` | PHPバージョンの取得・変更                       |
| 11  | [ドメイン設定](./domain.md)               | `domain.md`      | ドメインの一覧取得・追加・変更・削除・初期化               |
| 12  | [サブドメイン](./subdomain.md)            | `subdomain.md`   | サブドメインの一覧取得・追加・変更・削除                 |
| 13  | [SSL設定](./ssl.md)                   | `ssl.md`         | SSL証明書の一覧取得・インストール・削除                |
| 14  | [DNSレコード](./dns.md)                 | `dns.md`         | DNSレコードの一覧取得・追加・更新・削除                |
| 15  | [ログ](./log.md)                      | `log.md`         | アクセスログ・エラーログの取得                      |


## エンドポイント早見表


| メソッド   | パス                                                       | 権限   | セクション                        |
| ------ | -------------------------------------------------------- | ---- | ---------------------------- |
| GET    | `/v1/me`                                                 | 読み取り | [APIキー情報](./api-key.md)      |
| GET    | `/v1/server/{servername}/server-info`                    | 読み取り | [サーバー情報](./server-info.md)   |
| GET    | `/v1/server/{servername}/server-info/usage`              | 読み取り | [サーバー情報](./server-info.md)   |
| GET    | `/v1/server/{servername}/cron`                           | 読み取り | [Cron設定](./cron.md)          |
| POST   | `/v1/server/{servername}/cron`                           | 書き込み | [Cron設定](./cron.md)          |
| PUT    | `/v1/server/{servername}/cron/{cron_id}`                 | 書き込み | [Cron設定](./cron.md)          |
| DELETE | `/v1/server/{servername}/cron/{cron_id}`                 | 書き込み | [Cron設定](./cron.md)          |
| GET    | `/v1/server/{servername}/wp`                             | 読み取り | [WordPress](./wordpress.md)  |
| POST   | `/v1/server/{servername}/wp`                             | 書き込み | [WordPress](./wordpress.md)  |
| PUT    | `/v1/server/{servername}/wp/{wp_id}`                     | 書き込み | [WordPress](./wordpress.md)  |
| DELETE | `/v1/server/{servername}/wp/{wp_id}`                     | 書き込み | [WordPress](./wordpress.md)  |
| GET    | `/v1/server/{servername}/mail`                           | 読み取り | [メール](./mail.md)             |
| GET    | `/v1/server/{servername}/mail/{mail_account}`            | 読み取り | [メール](./mail.md)             |
| POST   | `/v1/server/{servername}/mail`                           | 書き込み | [メール](./mail.md)             |
| PUT    | `/v1/server/{servername}/mail/{mail_account}`            | 書き込み | [メール](./mail.md)             |
| DELETE | `/v1/server/{servername}/mail/{mail_account}`            | 書き込み | [メール](./mail.md)             |
| GET    | `/v1/server/{servername}/mail/{mail_account}/forwarding` | 読み取り | [メール](./mail.md)             |
| PUT    | `/v1/server/{servername}/mail/{mail_account}/forwarding` | 書き込み | [メール](./mail.md)             |
| GET    | `/v1/server/{servername}/mail-filter`                    | 読み取り | [メール振り分け](./mail-filter.md)  |
| POST   | `/v1/server/{servername}/mail-filter`                    | 書き込み | [メール振り分け](./mail-filter.md)  |
| DELETE | `/v1/server/{servername}/mail-filter/{filter_id}`        | 書き込み | [メール振り分け](./mail-filter.md)  |
| GET    | `/v1/server/{servername}/ftp`                            | 読み取り | [FTP](./ftp.md)              |
| POST   | `/v1/server/{servername}/ftp`                            | 書き込み | [FTP](./ftp.md)              |
| PUT    | `/v1/server/{servername}/ftp/{ftp_account}`              | 書き込み | [FTP](./ftp.md)              |
| DELETE | `/v1/server/{servername}/ftp/{ftp_account}`              | 書き込み | [FTP](./ftp.md)              |
| GET    | `/v1/server/{servername}/db`                             | 読み取り | [MySQL](./mysql.md)          |
| POST   | `/v1/server/{servername}/db`                             | 書き込み | [MySQL](./mysql.md)          |
| PUT    | `/v1/server/{servername}/db/{db_name}`                   | 書き込み | [MySQL](./mysql.md)          |
| DELETE | `/v1/server/{servername}/db/{db_name}`                   | 書き込み | [MySQL](./mysql.md)          |
| GET    | `/v1/server/{servername}/db/user`                        | 読み取り | [MySQL](./mysql.md)          |
| POST   | `/v1/server/{servername}/db/user`                        | 書き込み | [MySQL](./mysql.md)          |
| PUT    | `/v1/server/{servername}/db/user/{db_user}`              | 書き込み | [MySQL](./mysql.md)          |
| DELETE | `/v1/server/{servername}/db/user/{db_user}`              | 書き込み | [MySQL](./mysql.md)          |
| GET    | `/v1/server/{servername}/db/user/{db_user}/grant`        | 読み取り | [MySQL](./mysql.md)          |
| POST   | `/v1/server/{servername}/db/user/{db_user}/grant`        | 書き込み | [MySQL](./mysql.md)          |
| DELETE | `/v1/server/{servername}/db/user/{db_user}/grant`        | 書き込み | [MySQL](./mysql.md)          |
| GET    | `/v1/server/{servername}/php-version`                    | 読み取り | [PHPバージョン](./php-version.md) |
| PUT    | `/v1/server/{servername}/php-version/{domain}`           | 書き込み | [PHPバージョン](./php-version.md) |
| GET    | `/v1/server/{servername}/domain`                         | 読み取り | [ドメイン](./domain.md)          |
| GET    | `/v1/server/{servername}/domain/{domain}`                | 読み取り | [ドメイン](./domain.md)          |
| POST   | `/v1/server/{servername}/domain`                         | 書き込み | [ドメイン](./domain.md)          |
| PUT    | `/v1/server/{servername}/domain/{domain}`                | 書き込み | [ドメイン](./domain.md)          |
| DELETE | `/v1/server/{servername}/domain/{domain}`                | 書き込み | [ドメイン](./domain.md)          |
| POST   | `/v1/server/{servername}/domain/{domain}/reset`          | 書き込み | [ドメイン](./domain.md)          |
| GET    | `/v1/server/{servername}/subdomain`                      | 読み取り | [サブドメイン](./subdomain.md)     |
| POST   | `/v1/server/{servername}/subdomain`                      | 書き込み | [サブドメイン](./subdomain.md)     |
| PUT    | `/v1/server/{servername}/subdomain/{subdomain}`          | 書き込み | [サブドメイン](./subdomain.md)     |
| DELETE | `/v1/server/{servername}/subdomain/{subdomain}`          | 書き込み | [サブドメイン](./subdomain.md)     |
| GET    | `/v1/server/{servername}/ssl`                            | 読み取り | [SSL](./ssl.md)              |
| POST   | `/v1/server/{servername}/ssl`                            | 書き込み | [SSL](./ssl.md)              |
| DELETE | `/v1/server/{servername}/ssl/{common_name}`              | 書き込み | [SSL](./ssl.md)              |
| GET    | `/v1/server/{servername}/dns`                            | 読み取り | [DNS](./dns.md)              |
| POST   | `/v1/server/{servername}/dns`                            | 書き込み | [DNS](./dns.md)              |
| PUT    | `/v1/server/{servername}/dns/{dns_id}`                   | 書き込み | [DNS](./dns.md)              |
| DELETE | `/v1/server/{servername}/dns/{dns_id}`                   | 書き込み | [DNS](./dns.md)              |
| GET    | `/v1/server/{servername}/access-log`                     | 読み取り | [ログ](./log.md)               |
| GET    | `/v1/server/{servername}/error-log`                      | 読み取り | [ログ](./log.md)               |


