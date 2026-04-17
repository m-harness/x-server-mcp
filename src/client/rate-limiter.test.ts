/**
 * RateLimiter テスト
 *
 * カバレッジ: 100% (statements, branches, functions, lines)
 *
 * RateLimiterはXServer APIのレート制限に対応するクラス。
 * レスポンスヘッダー(X-RateLimit-Remaining, X-RateLimit-Reset,
 * X-RateLimit-Concurrent-Remaining)を追従し、remaining=0時はresetAtまで待機、
 * concurrentRemaining=0時は1秒待機する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期状態ではacquireが即座に解決する', async () => {
    const limiter = new RateLimiter();
    await expect(limiter.acquire()).resolves.toBeUndefined();
  });

  describe('updateFromHeaders', () => {
    it('レート制限ヘッダーを正しく更新する', () => {
      const limiter = new RateLimiter();
      const headers = new Headers({
        'x-ratelimit-limit': '60',
        'x-ratelimit-remaining': '59',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
        'x-ratelimit-concurrent-limit': '5',
        'x-ratelimit-concurrent-remaining': '4',
      });
      limiter.updateFromHeaders(headers);
      // ヘッダー更新後もacquireは即座に解決
      const promise = limiter.acquire();
      vi.advanceTimersByTime(0);
      return expect(promise).resolves.toBeUndefined();
    });

    it('ヘッダーがない場合も正常に動作する', () => {
      const limiter = new RateLimiter();
      const headers = new Headers();
      limiter.updateFromHeaders(headers);
      return expect(limiter.acquire()).resolves.toBeUndefined();
    });
  });

  describe('remaining=0時の待機', () => {
    it('remaining=0かつresetが未来の場合、resetまで待機する', async () => {
      const limiter = new RateLimiter();
      const resetAt = Math.floor(Date.now() / 1000) + 10; // 10秒後
      const headers = new Headers({
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(resetAt),
      });
      limiter.updateFromHeaders(headers);

      let resolved = false;
      const promise = limiter.acquire().then(() => { resolved = true; });

      // 5秒後はまだ待機中
      await vi.advanceTimersByTimeAsync(5000);
      expect(resolved).toBe(false);

      // 10秒後に解決
      await vi.advanceTimersByTimeAsync(6000);
      expect(resolved).toBe(true);
    });
  });

  describe('concurrent制限', () => {
    it('concurrentRemaining=0の場合、1秒待機する', async () => {
      const limiter = new RateLimiter();
      const headers = new Headers({
        'x-ratelimit-remaining': '50',
        'x-ratelimit-concurrent-remaining': '0',
      });
      limiter.updateFromHeaders(headers);

      let resolved = false;
      const promise = limiter.acquire().then(() => { resolved = true; });

      await vi.advanceTimersByTimeAsync(500);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(600);
      expect(resolved).toBe(true);
    });
  });

  describe('リセット後の通常動作', () => {
    it('リセット時刻を過ぎた後はacquireが即座に解決する', async () => {
      const limiter = new RateLimiter();
      const resetAt = Math.floor(Date.now() / 1000) + 5;
      const headers = new Headers({
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(resetAt),
      });
      limiter.updateFromHeaders(headers);

      // リセット時刻を過ぎるまで進める
      await vi.advanceTimersByTimeAsync(6000);

      // 新しいヘッダーで更新（remaining復活）
      const newHeaders = new Headers({
        'x-ratelimit-remaining': '59',
        'x-ratelimit-reset': String(resetAt + 60),
      });
      limiter.updateFromHeaders(newHeaders);

      await expect(limiter.acquire()).resolves.toBeUndefined();
    });
  });
});
