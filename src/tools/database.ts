import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

function registerDbTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'db-list',
    'MySQLデータベース一覧を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-list 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/db'));
      });
    },
  );

  server.tool(
    'db-create',
    'MySQLデータベースを作成します',
    {
      servername: servernameSchema,
      name_suffix: z.string().describe('データベース名サフィックス（例: db01）'),
      character_set: z.string().optional().describe('文字セット（デフォルト: utf8mb4）'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-create 実行', { servername: name });
        return await apiClient.post(apiClient.serverPath(name, '/db'), body);
      });
    },
  );

  server.tool(
    'db-update',
    'データベース設定を変更します（メモ）',
    {
      servername: servernameSchema,
      db_name: z.string().describe('データベース名'),
      memo: z.string().describe('メモ'),
    },
    async ({ servername, db_name, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-update 実行', { servername: name, db_name });
        return await apiClient.put(apiClient.serverPath(name, `/db/${db_name}`), body);
      });
    },
  );

  server.tool(
    'db-delete',
    'データベースを削除します。【警告】データベースに格納されているデータも全て削除されます',
    {
      servername: servernameSchema,
      db_name: z.string().describe('データベース名'),
    },
    async ({ servername, db_name }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-delete 実行', { servername: name, db_name });
        return await apiClient.delete(apiClient.serverPath(name, `/db/${db_name}`));
      });
    },
  );
}

function registerDbUserTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'db-user-list',
    'MySQLユーザー一覧を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-user-list 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/db/user'));
      });
    },
  );

  server.tool(
    'db-user-create',
    'MySQLユーザーを作成します',
    {
      servername: servernameSchema,
      name_suffix: z.string().describe('ユーザー名サフィックス（例: user01）'),
      password: z.string().min(6).describe('パスワード（6文字以上）'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-user-create 実行', { servername: name });
        return await apiClient.post(apiClient.serverPath(name, '/db/user'), body);
      });
    },
  );

  server.tool(
    'db-user-update',
    'MySQLユーザーを変更します',
    {
      servername: servernameSchema,
      db_user: z.string().describe('データベースユーザー名'),
      password: z.string().min(6).optional().describe('新しいパスワード'),
      memo: z.string().optional().describe('メモ'),
    },
    async ({ servername, db_user, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-user-update 実行', { servername: name, db_user });
        return await apiClient.put(
          apiClient.serverPath(name, `/db/user/${encodeURIComponent(db_user)}`),
          body,
        );
      });
    },
  );

  server.tool(
    'db-user-delete',
    'MySQLユーザーを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      db_user: z.string().describe('データベースユーザー名'),
    },
    async ({ servername, db_user }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-user-delete 実行', { servername: name, db_user });
        return await apiClient.delete(
          apiClient.serverPath(name, `/db/user/${encodeURIComponent(db_user)}`),
        );
      });
    },
  );
}

function registerDbGrantTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'db-grant-list',
    'データベース権限一覧を取得します',
    {
      servername: servernameSchema,
      db_user: z.string().describe('データベースユーザー名'),
    },
    async ({ servername, db_user }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-grant-list 実行', { servername: name, db_user });
        return await apiClient.get(
          apiClient.serverPath(name, `/db/user/${encodeURIComponent(db_user)}/grant`),
        );
      });
    },
  );

  server.tool(
    'db-grant-add',
    'データベース権限を付与します',
    {
      servername: servernameSchema,
      db_user: z.string().describe('データベースユーザー名'),
      db_name: z.string().describe('データベース名'),
    },
    async ({ servername, db_user, db_name }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-grant-add 実行', { servername: name, db_user, db_name });
        return await apiClient.post(
          apiClient.serverPath(name, `/db/user/${encodeURIComponent(db_user)}/grant`),
          { db_name },
        );
      });
    },
  );

  server.tool(
    'db-grant-remove',
    'データベース権限を削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      db_user: z.string().describe('データベースユーザー名'),
      db_name: z.string().describe('データベース名'),
    },
    async ({ servername, db_user, db_name }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('db-grant-remove 実行', { servername: name, db_user, db_name });
        return await apiClient.delete(
          apiClient.serverPath(name, `/db/user/${encodeURIComponent(db_user)}/grant`),
          { db_name },
        );
      });
    },
  );
}

export function registerDatabaseTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  registerDbTools(server, apiClient, config, logger);
  registerDbUserTools(server, apiClient, config, logger);
  registerDbGrantTools(server, apiClient, config, logger);
}
