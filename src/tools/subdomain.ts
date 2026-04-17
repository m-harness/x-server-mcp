import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerSubdomainTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'subdomain-list',
    'サブドメイン一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('subdomain-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/subdomain'), query);
      });
    },
  );

  server.tool(
    'subdomain-create',
    'サブドメインを追加します。日本語ドメイン部分はPunycodeで指定してください',
    {
      servername: servernameSchema,
      subdomain: z.string().describe('サブドメイン（例: blog.example.com）'),
      ssl: z.boolean().optional().describe('SSL有効化（デフォルト: true）'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('subdomain-create 実行', { servername: name, subdomain: body.subdomain });
        return await apiClient.post(apiClient.serverPath(name, '/subdomain'), body);
      });
    },
  );

  server.tool(
    'subdomain-update',
    'サブドメインのメモを更新します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      subdomain: z.string().describe('サブドメイン（Punycodeで指定）'),
      memo: z.string().describe('メモ'),
    },
    async ({ servername, subdomain, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('subdomain-update 実行', { servername: name, subdomain });
        return await apiClient.put(
          apiClient.serverPath(name, `/subdomain/${encodeURIComponent(subdomain)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'subdomain-delete',
    'サブドメインを削除します。【警告】この操作は元に戻せません。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      subdomain: z.string().describe('サブドメイン（Punycodeで指定）'),
      delete_files: z.boolean().optional().describe('ディレクトリも削除（デフォルト: false）'),
    },
    async ({ servername, subdomain, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('subdomain-delete 実行', { servername: name, subdomain });
        return await apiClient.delete(
          apiClient.serverPath(name, `/subdomain/${encodeURIComponent(subdomain)}`),
          body,
        );
      });
    },
  );
}
