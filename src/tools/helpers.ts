import { z } from 'zod';
import { XServerApiError } from '../utils/errors.js';
import type { AppConfig } from '../utils/config.js';

export const servernameSchema = z.string().optional().describe(
  'サーバー名（省略時は環境変数 XSERVER_SERVER_NAME を使用）。日本語ドメインの場合はPunycodeで指定してください'
);

export function resolveServername(input: string | undefined, config: AppConfig): string {
  const servername = input ?? config.serverName;
  if (!servername) {
    throw new XServerApiError(
      400,
      'MISSING_SERVERNAME',
      'servernameが指定されていません。引数で指定するか、環境変数 XSERVER_SERVER_NAME を設定してください',
    );
  }
  return servername;
}

export function successResponse(data: unknown): { content: Array<{ type: 'text'; text: string }> } {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export async function handleToolExecution<T>(
  fn: () => Promise<T>,
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: true }> {
  try {
    const result = await fn();
    return successResponse(result);
  } catch (error) {
    if (error instanceof XServerApiError) {
      return error.toMcpResponse();
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: { errorMessage: message } }) }],
    };
  }
}
