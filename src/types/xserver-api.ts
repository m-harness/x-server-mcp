/** XServer API 共通エラーレスポンス型 */
export interface XServerErrorResponse {
  error_code: string;
  error_message: string;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

/** XServer API レート制限ヘッダー */
export interface RateLimitHeaders {
  'x-ratelimit-limit'?: string;
  'x-ratelimit-remaining'?: string;
  'x-ratelimit-reset'?: string;
  'x-ratelimit-concurrent-limit'?: string;
  'x-ratelimit-concurrent-remaining'?: string;
}
