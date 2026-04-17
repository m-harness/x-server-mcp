import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerDomainTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'domain-list',
    'ドメイン一覧を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-list 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/domain'));
      });
    },
  );

  server.tool(
    'domain-get',
    'ドメイン詳細を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-get 実行', { servername: name, domain });
        return await apiClient.get(
          apiClient.serverPath(name, `/domain/${encodeURIComponent(domain)}`),
        );
      });
    },
  );

  server.tool(
    'domain-create',
    'ドメインを追加します。【注意】事前にドメイン所有権確認のTXTレコード設定が必要です。日本語ドメインはそのまま指定可能です',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（日本語ドメイン可）'),
      ssl: z.boolean().optional().describe('SSL有効化（デフォルト: true）'),
      redirect_https: z.boolean().optional().describe('HTTPSリダイレクト（デフォルト: sslと同じ）'),
      ai_crawler_block_enabled: z.boolean().optional().describe('AIクローラーブロック（デフォルト: true）'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-create 実行', { servername: name, domain: body.domain });
        return await apiClient.post(apiClient.serverPath(name, '/domain'), body);
      });
    },
  );

  server.tool(
    'domain-update',
    'ドメイン設定を変更します（メモ）。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（Punycodeで指定）'),
      memo: z.string().describe('メモ'),
    },
    async ({ servername, domain, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-update 実行', { servername: name, domain });
        return await apiClient.put(
          apiClient.serverPath(name, `/domain/${encodeURIComponent(domain)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'domain-delete',
    'ドメインを削除します。【警告】ドメインに紐づくメールアカウント等も影響を受ける可能性があります。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（Punycodeで指定）'),
      delete_files: z.boolean().optional().describe('ディレクトリも削除（デフォルト: false）'),
    },
    async ({ servername, domain, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-delete 実行', { servername: name, domain });
        return await apiClient.delete(
          apiClient.serverPath(name, `/domain/${encodeURIComponent(domain)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'domain-reset',
    'ドメイン設定を初期化します。【警告】この操作は元に戻せません。type=allで全設定、web=Web領域のみ、other=Web以外を初期化します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（Punycodeで指定）'),
      type: z.enum(['all', 'web', 'other']).describe('初期化タイプ'),
    },
    async ({ servername, domain, type }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('domain-reset 実行', { servername: name, domain, type });
        return await apiClient.post(
          apiClient.serverPath(name, `/domain/${encodeURIComponent(domain)}/reset`),
          { type },
        );
      });
    },
  );
}
