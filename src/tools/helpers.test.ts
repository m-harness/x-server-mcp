/**
 * ツール共通ヘルパー テスト
 *
 * カバレッジ: 100% (statements, branches, functions, lines)
 *
 * 全ツールで共用するヘルパー関数群:
 * - resolveServername: 引数 > 環境変数 > エラー の優先順位でサーバー名を解決
 * - successResponse: データをMCP TextContent形式に変換
 * - handleToolExecution: ツール実行をラップし、エラーを自動キャッチ→MCP形式に変換
 */
import { describe, it, expect, vi } from 'vitest';
import { resolveServername, successResponse, handleToolExecution } from './helpers.js';
import { XServerApiError } from '../utils/errors.js';
import type { AppConfig } from '../utils/config.js';

describe('resolveServername', () => {
  const baseConfig: AppConfig = { apiKey: 'xs_key', logLevel: 'info', logDir: './logs' };

  it('引数が指定されている場合は引数を返す', () => {
    const config = { ...baseConfig, serverName: 'env_server' };
    expect(resolveServername('arg_server', config)).toBe('arg_server');
  });

  it('引数がundefinedの場合は環境変数を返す', () => {
    const config = { ...baseConfig, serverName: 'env_server' };
    expect(resolveServername(undefined, config)).toBe('env_server');
  });

  it('両方undefinedの場合はエラーを投げる', () => {
    expect(() => resolveServername(undefined, baseConfig)).toThrow('servernameが指定されていません');
  });
});

describe('successResponse', () => {
  it('データをMCP TextContent形式に変換する', () => {
    const data = { crons: [{ id: 1 }] };
    const response = successResponse(data);
    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(JSON.parse(response.content[0].text)).toEqual(data);
  });

  it('整形されたJSONを出力する', () => {
    const response = successResponse({ key: 'value' });
    expect(response.content[0].text).toContain('\n');
  });
});

describe('handleToolExecution', () => {
  it('正常実行時はsuccessResponseを返す', async () => {
    const result = await handleToolExecution(async () => ({ ok: true }));
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.ok).toBe(true);
  });

  it('XServerApiErrorをキャッチしてMCPエラー形式に変換する', async () => {
    const result = await handleToolExecution(async () => {
      throw new XServerApiError(404, 'NOT_FOUND', 'リソースが見つかりません');
    });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error.statusCode).toBe(404);
  });

  it('一般的なErrorをキャッチしてエラーメッセージを返す', async () => {
    const result = await handleToolExecution(async () => {
      throw new Error('ネットワークエラー');
    });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error.errorMessage).toBe('ネットワークエラー');
  });

  it('文字列エラーもキャッチする', async () => {
    const result = await handleToolExecution(async () => {
      throw 'string error';
    });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error.errorMessage).toBe('string error');
  });
});
