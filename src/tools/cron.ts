import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerCronTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'cron-list',
    'Cron設定の一覧を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('cron-list 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/cron'));
      });
    },
  );

  server.tool(
    'cron-create',
    'Cronジョブを新規追加します',
    {
      servername: servernameSchema,
      minute: z.string().describe('分 (0-59, */5 等)'),
      hour: z.string().describe('時 (0-23, * 等)'),
      day: z.string().describe('日 (1-31, * 等)'),
      month: z.string().describe('月 (1-12, * 等)'),
      weekday: z.string().describe('曜日 (0-7, * 等)'),
      command: z.string().max(1024).describe('実行コマンド (最大1024文字)'),
      comment: z.string().optional().describe('コメント'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('cron-create 実行', { servername: name });
        return await apiClient.post(apiClient.serverPath(name, '/cron'), body);
      });
    },
  );

  server.tool(
    'cron-update',
    'Cronジョブを変更します',
    {
      servername: servernameSchema,
      cron_id: z.string().min(1).describe('Cron一覧取得で得られるハッシュID'),
      minute: z.string().optional().describe('分'),
      hour: z.string().optional().describe('時'),
      day: z.string().optional().describe('日'),
      month: z.string().optional().describe('月'),
      weekday: z.string().optional().describe('曜日'),
      command: z.string().max(1024).optional().describe('実行コマンド'),
      comment: z.string().optional().describe('コメント'),
      enabled: z.boolean().optional().describe('有効/無効'),
    },
    async ({ servername, cron_id, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('cron-update 実行', { servername: name, cron_id: String(cron_id) });
        return await apiClient.put(apiClient.serverPath(name, `/cron/${cron_id}`), body);
      });
    },
  );

  server.tool(
    'cron-delete',
    'Cronジョブを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      cron_id: z.string().min(1).describe('Cron一覧取得で得られるハッシュID'),
    },
    async ({ servername, cron_id }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('cron-delete 実行', { servername: name, cron_id: String(cron_id) });
        return await apiClient.delete(apiClient.serverPath(name, `/cron/${cron_id}`));
      });
    },
  );
}
