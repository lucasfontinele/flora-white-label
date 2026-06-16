import { AppException } from "./app-exception.js";

export class ForbiddenException extends AppException {
  constructor(message = "Acesso negado.", details?: unknown) {
    super({
      code: "FORBIDDEN",
      details,
      message,
      statusCode: 403,
    });
  }
}
