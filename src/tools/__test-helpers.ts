import { z } from 'zod';
import { vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { Logger } from '../utils/logger.js';
import type { AppConfig } from '../utils/config.js';

export function createMockApiClient(): XServerApiClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    serverPath: vi.fn((servername: string, path: string) => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return `/v1/server/${servername}${normalizedPath}`;
    }),
  } as unknown as XServerApiClient;
}

export function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

export function createMockConfig(overrides?: Partial<AppConfig>): AppConfig {
  return {
    apiKey: 'xs_test_key',
    serverName: 'xs123456',
    logLevel: 'info',
    logDir: './logs',
    ...overrides,
  };
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export interface ToolCapture {
  name: string;
  schema: unknown;
  handler: ToolHandler;
}

export function createMockServer(): { server: McpServer; getTools: () => Map<string, ToolCapture> } {
  const tools = new Map<string, ToolCapture>();

  const server = {
    tool: vi.fn((...args: unknown[]) => {
      // server.tool(name, schema, handler) — 3 args
      // server.tool(name, description, schema, handler) — 4 args
      let name: string;
      let schema: unknown;
      let handler: ToolHandler;
      if (args.length >= 4) {
        name = args[0] as string;
        schema = args[2];
        handler = args[3] as ToolHandler;
      } else {
        name = args[0] as string;
        schema = args[1];
        handler = args[2] as ToolHandler;
      }

      const validator = z.object(schema as Record<string, z.ZodTypeAny>);
      const validatedHandler: ToolHandler = async (input) => {
        const parsed = validator.parse(input ?? {});
        return handler(parsed);
      };

      tools.set(name, { name, schema, handler: validatedHandler });
    }),
  } as unknown as McpServer;

  return { server, getTools: () => tools };
}

export interface MockDependencies {
  server: McpServer;
  apiClient: XServerApiClient;
  config: AppConfig;
  logger: Logger;
  getTools: () => Map<string, ToolCapture>;
}

export function createMockDependencies(configOverrides?: Partial<AppConfig>): MockDependencies {
  const { server, getTools } = createMockServer();
  return {
    server,
    apiClient: createMockApiClient(),
    config: createMockConfig(configOverrides),
    logger: createMockLogger(),
    getTools,
  };
}
