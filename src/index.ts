import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './utils/config.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const { server, logger } = createServer(config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCPサーバー起動完了（stdio transport）');
}

main().catch((error) => {
  console.error('MCPサーバー起動エラー:', error);
  process.exit(1);
});
