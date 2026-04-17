/**
 * XServerApiError テスト
 *
 * カバレッジ: 100% (statements, branches, functions, lines)
 *
 * XServerApiErrorはXServer APIからのエラーレスポンスをラップするカスタムエラークラス。
 * statusCode, errorCode, errorMessage, errors配列を保持し、
 * toMcpResponse()でMCP TextContent形式のエラーレスポンスに変換する。
 */
import { describe, it, expect } from 'vitest';
import { XServerApiError } from './errors.js';

describe('XServerApiError', () => {
  it('プロパティが正しく設定される', () => {
    const error = new XServerApiError(400, 'INVALID_PARAMETER', 'パラメータが不正です');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('INVALID_PARAMETER');
    expect(error.errorMessage).toBe('パラメータが不正です');
    expect(error.errors).toEqual([]);
    expect(error.name).toBe('XServerApiError');
    expect(error.message).toBe('パラメータが不正です');
    expect(error).toBeInstanceOf(Error);
  });

  it('errors配列を保持できる', () => {
    const details = [
      { field: 'domain', code: 'REQUIRED', message: 'ドメインは必須です' },
      { field: 'email', code: 'INVALID', message: 'メール形式が不正です' },
    ];
    const error = new XServerApiError(422, 'VALIDATION_ERROR', 'バリデーションエラー', details);
    expect(error.errors).toEqual(details);
    expect(error.errors).toHaveLength(2);
  });

  it('errors配列が空の場合も正しく動作する', () => {
    const error = new XServerApiError(500, 'INTERNAL_ERROR', 'サーバーエラー', []);
    expect(error.errors).toEqual([]);
  });

  describe('toMcpResponse', () => {
    it('基本的なエラーをMCP TextContent形式に変換する', () => {
      const error = new XServerApiError(404, 'NOT_FOUND', 'リソースが見つかりません');
      const response = error.toMcpResponse();
      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error.statusCode).toBe(404);
      expect(parsed.error.errorCode).toBe('NOT_FOUND');
      expect(parsed.error.errorMessage).toBe('リソースが見つかりません');
      expect(parsed.error.errors).toEqual([]);
    });

    it('errors配列を含むエラーを正しく変換する', () => {
      const details = [{ field: 'name', code: 'TOO_LONG', message: '名前が長すぎます' }];
      const error = new XServerApiError(400, 'VALIDATION_ERROR', 'バリデーションエラー', details);
      const response = error.toMcpResponse();

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error.errors).toEqual(details);
    });

    it('429エラーを正しく変換する', () => {
      const error = new XServerApiError(429, 'RATE_LIMIT_EXCEEDED', 'レート制限を超過しました');
      const response = error.toMcpResponse();

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error.statusCode).toBe(429);
      expect(parsed.error.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
