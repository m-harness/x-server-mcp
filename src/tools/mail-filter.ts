import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

const conditionSchema = z.object({
  keyword: z.string().describe('キーワード'),
  field: z.enum(['subject', 'from', 'to', 'body', 'header']).describe('対象フィールド'),
  match_type: z.enum(['contain', 'match', 'start_from']).describe('一致条件'),
});

const actionSchema = z.object({
  type: z.enum(['mail_address', 'spam_folder', 'trash', 'delete']).describe('アクション種別'),
  target: z.string().optional().describe('type=mail_addressの場合の転送先'),
  method: z.enum(['move', 'copy']).describe('処理方法'),
});

export function registerMailFilterTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'mail-filter-list',
    'メール振り分けルール一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-filter-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/mail-filter'), query);
      });
    },
  );

  server.tool(
    'mail-filter-create',
    'メール振り分けルールを追加します',
    {
      servername: servernameSchema,
      domain: z.string().max(253).describe('対象ドメイン（Punycodeで指定）'),
      conditions: z.array(conditionSchema).min(1).describe('振り分け条件（AND評価）'),
      action: actionSchema.describe('アクション'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-filter-create 実行', { servername: name, domain: body.domain });
        return await apiClient.post(apiClient.serverPath(name, '/mail-filter'), body);
      });
    },
  );

  server.tool(
    'mail-filter-delete',
    'メール振り分けルールを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      filter_id: z.string().min(1).describe('一覧取得で得られる文字列ID'),
    },
    async ({ servername, filter_id }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('mail-filter-delete 実行', { servername: name, filter_id: String(filter_id) });
        return await apiClient.delete(apiClient.serverPath(name, `/mail-filter/${filter_id}`));
      });
    },
  );
}
