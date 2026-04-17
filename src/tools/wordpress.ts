import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerWordPressTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'wp-list',
    'WordPress一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('wp-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/wp'), query);
      });
    },
  );

  server.tool(
    'wp-install',
    'WordPressを新規インストールします。管理者パスワードはログに記録されません',
    {
      servername: servernameSchema,
      url: z.string().max(512).describe('インストール先URL（例: example.com/blog）'),
      title: z.string().max(255).describe('サイトタイトル'),
      admin_username: z.string().max(255).describe('管理者ユーザー名'),
      admin_password: z.string().min(7).describe('管理者パスワード（7文字以上）'),
      admin_email: z.string().max(255).describe('管理者メールアドレス'),
      memo: z.string().max(500).optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('wp-install 実行', { servername: name, url: body.url });
        return await apiClient.post(apiClient.serverPath(name, '/wp'), body);
      });
    },
  );

  server.tool(
    'wp-update',
    'WordPress設定を変更します（メモのみ）',
    {
      servername: servernameSchema,
      wp_id: z.string().min(1).describe('WordPress一覧取得で得られる文字列ID'),
      memo: z.string().max(500).optional().describe('メモ'),
    },
    async ({ servername, wp_id, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('wp-update 実行', { servername: name, wp_id: String(wp_id) });
        return await apiClient.put(apiClient.serverPath(name, `/wp/${wp_id}`), body);
      });
    },
  );

  server.tool(
    'wp-delete',
    'WordPressを削除します。【警告】関連するデータベース・Cronも削除される可能性があります',
    {
      servername: servernameSchema,
      wp_id: z.string().min(1).describe('WordPress一覧取得で得られる文字列ID'),
      delete_db: z.boolean().optional().describe('データベースも削除（デフォルト: true）'),
      delete_db_user: z.boolean().optional().describe('DBユーザーも削除（デフォルト: false）'),
      delete_cron: z.boolean().optional().describe('Cronも削除（デフォルト: true）'),
    },
    async ({ servername, wp_id, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('wp-delete 実行', { servername: name, wp_id: String(wp_id) });
        return await apiClient.delete(apiClient.serverPath(name, `/wp/${wp_id}`), body);
      });
    },
  );
}
