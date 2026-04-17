import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerMailTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'mail-list',
    'メールアカウント一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/mail'), query);
      });
    },
  );

  server.tool(
    'mail-get',
    'メールアカウントの詳細（使用量含む）を取得します',
    {
      servername: servernameSchema,
      mail_account: z.string().describe('メールアカウント（例: user@example.com）'),
    },
    async ({ servername, mail_account }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-get 実行', { servername: name, mail_account });
        return await apiClient.get(
          apiClient.serverPath(name, `/mail/${encodeURIComponent(mail_account)}`),
        );
      });
    },
  );

  server.tool(
    'mail-create',
    'メールアカウントを作成します。【注意】事前にドメイン所有権確認のTXTレコード設定が必要です',
    {
      servername: servernameSchema,
      mail_address: z.string().describe('メールアドレス'),
      password: z.string().min(6).describe('パスワード（6文字以上）'),
      quota_mb: z.number().min(1).max(50000).optional().describe('容量制限(MB)'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-create 実行', { servername: name, mail_address: body.mail_address });
        return await apiClient.post(apiClient.serverPath(name, '/mail'), body);
      });
    },
  );

  server.tool(
    'mail-update',
    'メールアカウントを変更します',
    {
      servername: servernameSchema,
      mail_account: z.string().describe('メールアカウント'),
      password: z.string().min(6).optional().describe('新しいパスワード'),
      quota_mb: z.number().min(1).max(50000).optional().describe('容量制限(MB)'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, mail_account, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-update 実行', { servername: name, mail_account });
        return await apiClient.put(
          apiClient.serverPath(name, `/mail/${encodeURIComponent(mail_account)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'mail-delete',
    'メールアカウントを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      mail_account: z.string().describe('メールアカウント'),
    },
    async ({ servername, mail_account }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-delete 実行', { servername: name, mail_account });
        return await apiClient.delete(
          apiClient.serverPath(name, `/mail/${encodeURIComponent(mail_account)}`),
        );
      });
    },
  );

  server.tool(
    'mail-forwarding-get',
    'メール転送設定を取得します',
    {
      servername: servernameSchema,
      mail_account: z.string().describe('メールアカウント'),
    },
    async ({ servername, mail_account }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-forwarding-get 実行', { servername: name, mail_account });
        return await apiClient.get(
          apiClient.serverPath(name, `/mail/${encodeURIComponent(mail_account)}/forwarding`),
        );
      });
    },
  );

  server.tool(
    'mail-forwarding-update',
    'メール転送設定を更新します',
    {
      servername: servernameSchema,
      mail_account: z.string().describe('メールアカウント'),
      forwarding_addresses: z.array(z.string()).optional().describe('転送先アドレス一覧（空配列で解除）'),
      keep_in_mailbox: z.boolean().optional().describe('メールボックスにも残す'),
    },
    async ({ servername, mail_account, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-forwarding-update 実行', { servername: name, mail_account });
        return await apiClient.put(
          apiClient.serverPath(name, `/mail/${encodeURIComponent(mail_account)}/forwarding`),
          body,
        );
      });
    },
  );
}
