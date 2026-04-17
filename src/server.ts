import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { XServerApiClient } from './client/api-client.js';
import { Logger } from './utils/logger.js';
import { type AppConfig } from './utils/config.js';
import { registerAllTools } from './tools/index.js';

export function createServer(config: AppConfig): { server: McpServer; logger: Logger } {
  const logger = new Logger({ logDir: config.logDir, logLevel: config.logLevel });
  const apiClient = new XServerApiClient({ apiKey: config.apiKey, logger });

  const server = new McpServer({
    name: 'x-server-mcp',
    version: '0.1.0',
  });

  registerAllTools(server, apiClient, config, logger);

  logger.info('MCPサーバー初期化完了');

  return { server, logger };
}
