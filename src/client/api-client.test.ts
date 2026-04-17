/**
 * XServerApiClient テスト
 *
 * カバレッジ: 95%+ (statements, branches, functions, lines)
 *
 * XServerApiClientはXServer REST APIとの通信を担当するクラス。
 * - ベースURL: https://api.xserver.ne.jp/v1
 * - 認証: Authorization: Bearer {apiKey}
 * - サーバーパス: /server/{servername}/...
 * - リトライ: 429→Retry-After秒×最大3回、502→5秒×最大2回
 * - RateLimiter連携でレート制限を自動管理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XServerApiClient } from './api-client.js';
import type { Logger } from '../utils/logger.js';

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

describe('XServerApiClient', () => {
  let client: XServerApiClient;
  let mockLogger: Logger;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = mockFetch;
    mockLogger = createMockLogger();
    client = new XServerApiClient({
      apiKey: 'xs_test_key_123',
      logger: mockLogger,
    });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers(headers ?? {}),
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response;
  }

  describe('serverPath', () => {
    it('サーバー名でパスを生成する', () => {
      expect(client.serverPath('xs123', '/cron')).toBe('/v1/server/xs123/cron');
    });

    it('パスにスラッシュがない場合もスラッシュを補完しない', () => {
      expect(client.serverPath('xs123', 'cron')).toBe('/v1/server/xs123/cron');
    });
  });

  describe('GET リクエスト', () => {
    it('正常なGETリクエストを送信する', async () => {
      const responseData = { crons: [] };
      mockFetch.mockResolvedValueOnce(createResponse(200, responseData, {
        'x-ratelimit-remaining': '59',
      }));

      const resultPromise = client.get('/v1/server/xs123/cron');
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.xserver.ne.jp/v1/server/xs123/cron',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer xs_test_key_123',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('クエリパラメータを正しく付与する', async () => {
      mockFetch.mockResolvedValueOnce(createResponse(200, { mails: [] }));

      const resultPromise = client.get('/v1/server/xs123/mail', { domain: 'example.com' });
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.xserver.ne.jp/v1/server/xs123/mail?domain=example.com',
        expect.any(Object),
      );
    });
  });

  describe('POST リクエスト', () => {
    it('正常なPOSTリクエストを送信する', async () => {
      const responseData = { cron_id: 1 };
      mockFetch.mockResolvedValueOnce(createResponse(200, responseData));

      const resultPromise = client.post('/v1/server/xs123/cron', { schedule: '0 * * * *' });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.xserver.ne.jp/v1/server/xs123/cron',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ schedule: '0 * * * *' }),
        }),
      );
    });
  });

  describe('PUT リクエスト', () => {
    it('正常なPUTリクエストを送信する', async () => {
      mockFetch.mockResolvedValueOnce(createResponse(200, { success: true }));

      const resultPromise = client.put('/v1/server/xs123/cron/1', { schedule: '30 * * * *' });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({ success: true });
    });
  });

  describe('DELETE リクエスト', () => {
    it('正常なDELETEリクエストを送信する', async () => {
      mockFetch.mockResolvedValueOnce(createResponse(200, {}));

      const resultPromise = client.delete('/v1/server/xs123/cron/1');
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toEqual({});
    });
  });

  describe('エラーハンドリング', () => {
    it('4xxエラーでXServerApiErrorを投げる', async () => {
      mockFetch.mockResolvedValueOnce(createResponse(400, {
        error_code: 'INVALID_PARAMETER',
        error_message: 'パラメータ不正',
        errors: [{ field: 'name', code: 'REQUIRED', message: '必須です' }],
      }));

      await expect(client.get('/v1/test')).rejects.toThrow('パラメータ不正');
    });

    it('errorsフィールドがないAPIエラーも処理する', async () => {
      mockFetch.mockResolvedValueOnce(createResponse(404, {
        error_code: 'NOT_FOUND',
        error_message: '見つかりません',
      }));

      await expect(client.get('/v1/test')).rejects.toThrow('見つかりません');
    });

    it('fetch自体が失敗した場合はその例外をそのまま返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network down'));

      await expect(client.get('/v1/test')).rejects.toThrow('network down');
    });

    it('成功レスポンスのjson解析失敗を表面化する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
      } as unknown as Response);

      await expect(client.get('/v1/test')).rejects.toThrow('Unexpected end of JSON input');
    });

    it('エラーレスポンスのjson解析失敗も表面化する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers(),
        json: () => Promise.reject(new SyntaxError('Unexpected token <')),
      } as unknown as Response);

      await expect(client.get('/v1/test')).rejects.toThrow('Unexpected token <');
    });
  });

  describe('429 リトライ', () => {
    it('429エラーでRetry-After秒後にリトライする', async () => {
      mockFetch
        .mockResolvedValueOnce(createResponse(429, {
          error_code: 'RATE_LIMIT',
          error_message: 'レート制限',
        }, { 'retry-after': '2' }))
        .mockResolvedValueOnce(createResponse(200, { success: true }));

      const resultPromise = client.get('/v1/test');
      await vi.advanceTimersByTimeAsync(3000);
      const result = await resultPromise;

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('429エラーが3回連続するとエラーを投げる', async () => {
      for (let i = 0; i < 4; i++) {
        mockFetch.mockResolvedValueOnce(createResponse(429, {
          error_code: 'RATE_LIMIT',
          error_message: 'レート制限',
        }, { 'retry-after': '1' }));
      }

      const resultPromise = client.get('/v1/test').catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(20000);
      const error = await resultPromise;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('レート制限');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('502 リトライ', () => {
    it('502エラーで5秒後にリトライする', async () => {
      mockFetch
        .mockResolvedValueOnce(createResponse(502, {
          error_code: 'BAD_GATEWAY',
          error_message: 'Bad Gateway',
        }))
        .mockResolvedValueOnce(createResponse(200, { success: true }));

      const resultPromise = client.get('/v1/test');
      await vi.advanceTimersByTimeAsync(6000);
      const result = await resultPromise;

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('502エラーが2回連続するとエラーを投げる', async () => {
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce(createResponse(502, {
          error_code: 'BAD_GATEWAY',
          error_message: 'Bad Gateway',
        }));
      }

      const resultPromise = client.get('/v1/test').catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(30000);
      const error = await resultPromise;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Bad Gateway');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Retry-Afterヘッダーなしの429', () => {
    it('Retry-Afterがない場合はデフォルト60秒待機', async () => {
      mockFetch
        .mockResolvedValueOnce(createResponse(429, {
          error_code: 'RATE_LIMIT',
          error_message: 'レート制限',
        }))
        .mockResolvedValueOnce(createResponse(200, { ok: true }));

      const resultPromise = client.get('/v1/test');
      await vi.advanceTimersByTimeAsync(61000);
      const result = await resultPromise;

      expect(result).toEqual({ ok: true });
    });
  });
});
