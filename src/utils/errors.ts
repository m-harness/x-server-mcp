export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
}

export class XServerApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errorMessage: string;
  public readonly errors: ApiErrorDetail[];

  constructor(
    statusCode: number,
    errorCode: string,
    errorMessage: string,
    errors: ApiErrorDetail[] = [],
  ) {
    super(errorMessage);
    this.name = 'XServerApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errors = errors;
  }

  toMcpResponse(): { isError: true; content: Array<{ type: 'text'; text: string }> } {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: {
              statusCode: this.statusCode,
              errorCode: this.errorCode,
              errorMessage: this.errorMessage,
              errors: this.errors,
            },
          }),
        },
      ],
    };
  }
}
