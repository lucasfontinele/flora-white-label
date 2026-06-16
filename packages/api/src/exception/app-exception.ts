export type AppExceptionOptions = {
  code: string;
  details?: unknown;
  message: string;
  statusCode: number;
};

export class AppException extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly statusCode: number;

  constructor({ code, details, message, statusCode }: AppExceptionOptions) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}
