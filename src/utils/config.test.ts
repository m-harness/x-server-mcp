/**
 * Config テスト
 *
 * カバレッジ: 100% (statements, branches, functions, lines)
 *
 * loadConfig()は環境変数からアプリケーション設定を読み取る関数。
 * XSERVER_API_KEY(必須), XSERVER_SERVER_NAME(任意),
 * LOG_LEVEL(デフォルト:info), LOG_DIR(デフォルト:./logs)を管理する。
 * dotenvで.envファイルからも読み取り可能（process.envが優先）。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// dotenvをモックして、テスト時に実際の.envファイルを読み込まないようにする
const { mockDotenvConfig } = vi.hoisted(() => ({
  mockDotenvConfig: vi.fn(),
}));
vi.mock('dotenv', () => ({
  config: mockDotenvConfig,
}));

import { loadConfig } from './config.js';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // .envからの値を除去してクリーンな状態にする
    delete process.env.XSERVER_API_KEY;
    delete process.env.XSERVER_SERVER_NAME;
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_DIR;
    mockDotenvConfig.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('XSERVER_API_KEYが設定されていない場合はエラーを投げる', () => {
    expect(() => loadConfig()).toThrow('XSERVER_API_KEY');
  });

  it('必須の環境変数のみで正しく設定を読み込む', () => {
    process.env.XSERVER_API_KEY = 'xs_test_key';
    const config = loadConfig();
    expect(config.apiKey).toBe('xs_test_key');
    expect(config.serverName).toBeUndefined();
    expect(config.logLevel).toBe('info');
    expect(config.logDir).toBe('./logs');
  });

  it('全ての環境変数を読み込む', () => {
    process.env.XSERVER_API_KEY = 'xs_full_key';
    process.env.XSERVER_SERVER_NAME = 'xs123456';
    process.env.LOG_LEVEL = 'debug';
    process.env.LOG_DIR = '/var/log/mcp';
    const config = loadConfig();
    expect(config.apiKey).toBe('xs_full_key');
    expect(config.serverName).toBe('xs123456');
    expect(config.logLevel).toBe('debug');
    expect(config.logDir).toBe('/var/log/mcp');
  });

  it('XSERVER_SERVER_NAMEが空文字列の場合はundefined', () => {
    process.env.XSERVER_API_KEY = 'xs_key';
    process.env.XSERVER_SERVER_NAME = '';
    const config = loadConfig();
    expect(config.serverName).toBeUndefined();
  });

  it('LOG_LEVELが不正な値の場合はデフォルトを使用する', () => {
    process.env.XSERVER_API_KEY = 'xs_key';
    process.env.LOG_LEVEL = 'invalid_level';
    const config = loadConfig();
    expect(config.logLevel).toBe('info');
  });

  it('LOG_LEVELの各有効値を正しく認識する', () => {
    process.env.XSERVER_API_KEY = 'xs_key';

    for (const level of ['debug', 'info', 'warn', 'error']) {
      process.env.LOG_LEVEL = level;
      const config = loadConfig();
      expect(config.logLevel).toBe(level);
    }
  });

  it('dotenv.config()が呼び出される', () => {
    process.env.XSERVER_API_KEY = 'xs_key';
    loadConfig();
    expect(mockDotenvConfig).toHaveBeenCalled();
  });
});
