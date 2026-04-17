import * as fs from 'node:fs';
import * as path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = ['password', 'admin_password', 'apikey', 'authorization'];

interface LoggerOptions {
  logDir: string;
  logLevel: LogLevel;
}

function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      if (typeof value === 'string' && value.startsWith('Bearer ')) {
        masked[key] = 'Bearer xs_****';
      } else if (typeof value === 'string' && value.startsWith('xs_')) {
        masked[key] = 'xs_****';
      } else {
        masked[key] = '****';
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

export class Logger {
  private readonly logDir: string;
  private readonly logLevel: LogLevel;
  private dirEnsured = false;

  constructor(options: LoggerOptions) {
    this.logDir = options.logDir;
    this.logLevel = options.logLevel;
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelLabel = `[${level.toUpperCase()}]`;
    const maskedData = data ? maskSensitiveData(data) : undefined;

    let line = `${timestamp} ${levelLabel} ${message}`;
    if (maskedData) {
      line += ` ${JSON.stringify(maskedData)}`;
    }

    // stdoutは使わない（JSON-RPC専用）
    console.error(line);

    this.writeToFile(line);
  }

  private writeToFile(line: string): void {
    try {
      if (!this.dirEnsured) {
        if (!fs.existsSync(this.logDir)) {
          fs.mkdirSync(this.logDir, { recursive: true });
        }
        this.dirEnsured = true;
      }

      const today = new Date().toISOString().split('T')[0];
      const filePath = path.join(this.logDir, `${today}.log`);
      fs.appendFileSync(filePath, line + '\n', 'utf-8');
    } catch {
      // ファイル書き込みエラーでもクラッシュしない
    }
  }
}
