import { AppException } from "./app-exception.js";

export class UnauthorizedException extends AppException {
  constructor(message = "Não autorizado.", details?: unknown) {
    super({
      code: "UNAUTHORIZED",
      details,
      message,
      statusCode: 401,
    });
  }
}
