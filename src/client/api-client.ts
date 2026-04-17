import { XServerApiError } from '../utils/errors.js';
import { type Logger } from '../utils/logger.js';
import { RateLimiter } from './rate-limiter.js';
import type { XServerErrorResponse } from '../types/xserver-api.js';

const BASE_URL = 'https://api.xserver.ne.jp';
const MAX_RETRY_429 = 3;
const MAX_RETRY_502 = 2;
const DEFAULT_RETRY_AFTER = 60;
const RETRY_502_DELAY = 5000;

interface ApiClientOptions {
  apiKey: string;
  logger: Logger;
}

export class XServerApiClient {
  private readonly apiKey: string;
  private readonly logger: Logger;
  private readonly rateLimiter: RateLimiter;

  constructor(options: ApiClientOptions) {
    this.apiKey = options.apiKey;
    this.logger = options.logger;
    this.rateLimiter = new RateLimiter();
  }

  serverPath(servername: string, path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `/v1/server/${servername}${normalizedPath}`;
  }

  async get<T = unknown>(path: string, query?: Record<string, string>): Promise<T> {
    let url = `${BASE_URL}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }
    return this.request<T>('GET', url);
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', `${BASE_URL}${path}`, body);
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', `${BASE_URL}${path}`, body);
  }

  async delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('DELETE', `${BASE_URL}${path}`, body);
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    let lastError: XServerApiError | null = null;
    let retryCount429 = 0;
    let retryCount502 = 0;

    while (true) {
      await this.rateLimiter.acquire();

      this.logger.debug('API リクエスト', { method, url });

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      };

      if (body !== undefined && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      this.rateLimiter.updateFromHeaders(response.headers);

      if (response.ok) {
        const data = await response.json() as T;
        this.logger.debug('API レスポンス', { status: response.status, url });
        return data;
      }

      const errorBody = await response.json() as XServerErrorResponse;
      lastError = new XServerApiError(
        response.status,
        errorBody.error_code,
        errorBody.error_message,
        errorBody.errors ?? [],
      );

      // 429: Retry-After秒後にリトライ（最大3回）
      if (response.status === 429 && retryCount429 < MAX_RETRY_429) {
        const retryAfter = parseInt(response.headers.get('retry-after') ?? '', 10);
        const waitMs = (Number.isNaN(retryAfter) ? DEFAULT_RETRY_AFTER : retryAfter) * 1000;
        this.logger.warn('レート制限超過、リトライ待機', {
          retryCount: String(retryCount429 + 1),
          waitMs: String(waitMs),
        });
        await this.sleep(waitMs);
        retryCount429++;
        continue;
      }

      // 502: 5秒後にリトライ（最大2回）
      if (response.status === 502 && retryCount502 < MAX_RETRY_502) {
        this.logger.warn('502エラー、リトライ待機', {
          retryCount: String(retryCount502 + 1),
        });
        await this.sleep(RETRY_502_DELAY);
        retryCount502++;
        continue;
      }

      // リトライ不可
      this.logger.error('API エラー', {
        status: String(response.status),
        errorCode: errorBody.error_code,
        errorMessage: errorBody.error_message,
      });
      throw lastError;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
