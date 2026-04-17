import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerFtpTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'ftp-list',
    'FTPアカウント一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ftp-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/ftp'), query);
      });
    },
  );

  server.tool(
    'ftp-create',
    'FTPアカウントを追加します',
    {
      servername: servernameSchema,
      ftp_account: z.string().describe('FTPアカウント（user@domain形式）'),
      password: z.string().min(8).describe('パスワード（8文字以上）'),
      directory: z.string().optional().describe('ディレクトリ（デフォルト: /）'),
      quota_mb: z.number().optional().describe('容量制限(MB)'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ftp-create 実行', { servername: name, ftp_account: body.ftp_account });
        return await apiClient.post(apiClient.serverPath(name, '/ftp'), body);
      });
    },
  );

  server.tool(
    'ftp-update',
    'FTPアカウントを変更します',
    {
      servername: servernameSchema,
      ftp_account: z.string().describe('FTPアカウント'),
      password: z.string().min(8).optional().describe('新しいパスワード'),
      directory: z.string().optional().describe('ディレクトリ'),
      quota_mb: z.number().optional().describe('容量制限(MB)'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ftp_account, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ftp-update 実行', { servername: name, ftp_account });
        return await apiClient.put(
          apiClient.serverPath(name, `/ftp/${encodeURIComponent(ftp_account)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'ftp-delete',
    'FTPアカウントを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      ftp_account: z.string().describe('FTPアカウント'),
    },
    async ({ servername, ftp_account }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ftp-delete 実行', { servername: name, ftp_account });
        return await apiClient.delete(
          apiClient.serverPath(name, `/ftp/${encodeURIComponent(ftp_account)}`),
        );
      });
    },
  );
}
