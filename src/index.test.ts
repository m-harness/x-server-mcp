/**
 * エントリポイント テスト
 *
 * カバレッジ: 100%
 *
 * index.ts の起動成功、設定読み込み失敗、接続失敗時の終了経路を検証する。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppConfig } from './utils/config.js';

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('index.ts', () => {
  const baseConfig: AppConfig = {
    apiKey: 'xs_test_key',
    serverName: 'xs123456',
    logLevel: 'info',
    logDir: './logs',
  };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('./utils/config.js');
    vi.doUnmock('./server.js');
    vi.doUnmock('@modelcontextprotocol/sdk/server/stdio.js');
  });

  it('設定読み込みと接続に成功したら起動ログを出す', async () => {
    const loadConfig = vi.fn(() => baseConfig);
    const connect = vi.fn().mockResolvedValue(undefined);
    const logger = { info: vi.fn() };
    const createServer = vi.fn(() => ({ server: { connect }, logger }));
    const StdioServerTransport = vi.fn().mockImplementation(() => ({ kind: 'stdio' }));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => code as never) as never);

    vi.doMock('./utils/config.js', () => ({ loadConfig }));
    vi.doMock('./server.js', () => ({ createServer }));
    vi.doMock('@modelcontextprotocol/sdk/server/stdio.js', () => ({ StdioServerTransport }));

    await import('./index.js');
    await flushPromises();

    expect(loadConfig).toHaveBeenCalledTimes(1);
    expect(createServer).toHaveBeenCalledWith(baseConfig);
    expect(StdioServerTransport).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ kind: 'stdio' }));
    expect(logger.info).toHaveBeenCalledWith('MCPサーバー起動完了（stdio transport）');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('設定読み込みに失敗したらエラーログを出して終了する', async () => {
    const loadConfig = vi.fn(() => {
      throw new Error('missing api key');
    });
    const createServer = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => code as never) as never);

    vi.doMock('./utils/config.js', () => ({ loadConfig }));
    vi.doMock('./server.js', () => ({ createServer }));
    vi.doMock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
      StdioServerTransport: vi.fn(),
    }));

    await import('./index.js');
    await flushPromises();

    expect(createServer).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('MCPサーバー起動エラー:', expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('server.connectが失敗したらエラーログを出して終了する', async () => {
    const loadConfig = vi.fn(() => baseConfig);
    const connect = vi.fn().mockRejectedValue(new Error('connect failed'));
    const logger = { info: vi.fn() };
    const createServer = vi.fn(() => ({ server: { connect }, logger }));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => code as never) as never);

    vi.doMock('./utils/config.js', () => ({ loadConfig }));
    vi.doMock('./server.js', () => ({ createServer }));
    vi.doMock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
      StdioServerTransport: vi.fn().mockImplementation(() => ({ kind: 'stdio' })),
    }));

    await import('./index.js');
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('MCPサーバー起動エラー:', expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
