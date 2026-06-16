import { AppException } from "./app-exception.js";

export class InternalServerException extends AppException {
  constructor(message = "Erro interno do servidor.", details?: unknown) {
    super({
      code: "INTERNAL_SERVER_ERROR",
      details,
      message,
      statusCode: 500,
    });
  }
}
