import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';

import { registerApiKeyTools } from './api-key.js';
import { registerServerInfoTools } from './server-info.js';
import { registerCronTools } from './cron.js';
import { registerWordPressTools } from './wordpress.js';
import { registerMailTools } from './mail.js';
import { registerMailFilterTools } from './mail-filter.js';
import { registerFtpTools } from './ftp.js';
import { registerDatabaseTools } from './database.js';
import { registerDomainTools } from './domain.js';
import { registerSubdomainTools } from './subdomain.js';
import { registerSslTools } from './ssl.js';
import { registerDnsTools } from './dns.js';
import { registerPhpVersionTools } from './php-version.js';
import { registerLogTools } from './logs.js';

export function registerAllTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  registerApiKeyTools(server, apiClient, logger);
  registerServerInfoTools(server, apiClient, config, logger);
  registerCronTools(server, apiClient, config, logger);
  registerWordPressTools(server, apiClient, config, logger);
  registerMailTools(server, apiClient, config, logger);
  registerMailFilterTools(server, apiClient, config, logger);
  registerFtpTools(server, apiClient, config, logger);
  registerDatabaseTools(server, apiClient, config, logger);
  registerDomainTools(server, apiClient, config, logger);
  registerSubdomainTools(server, apiClient, config, logger);
  registerSslTools(server, apiClient, config, logger);
  registerDnsTools(server, apiClient, config, logger);
  registerPhpVersionTools(server, apiClient, config, logger);
  registerLogTools(server, apiClient, config, logger);
}
