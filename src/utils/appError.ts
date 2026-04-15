/**
 * AppError — a domain error with a stable `code` so the UI can branch on
 * failure kind without string-matching error messages.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

export const isAppError = (value: unknown): value is AppError =>
  value instanceof AppError;
