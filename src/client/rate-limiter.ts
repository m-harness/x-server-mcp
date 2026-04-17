export class RateLimiter {
  private remaining: number | null = null;
  private resetAt: number | null = null; // Unix timestamp (seconds)
  private concurrentRemaining: number | null = null;

  updateFromHeaders(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    const concurrentRemaining = headers.get('x-ratelimit-concurrent-remaining');

    if (remaining !== null) {
      this.remaining = parseInt(remaining, 10);
    }
    if (reset !== null) {
      this.resetAt = parseInt(reset, 10);
    }
    if (concurrentRemaining !== null) {
      this.concurrentRemaining = parseInt(concurrentRemaining, 10);
    }
  }

  async acquire(): Promise<void> {
    // レート制限チェック: remaining=0 → resetAtまで待機
    if (this.remaining !== null && this.remaining <= 0 && this.resetAt !== null) {
      const nowSec = Math.floor(Date.now() / 1000);
      const waitSec = this.resetAt - nowSec;
      if (waitSec > 0) {
        await this.sleep((waitSec + 1) * 1000);
      }
    }

    // 同時接続制限チェック: concurrentRemaining=0 → 1秒待機
    if (this.concurrentRemaining !== null && this.concurrentRemaining <= 0) {
      await this.sleep(1000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
