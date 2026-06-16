import { AppException } from "./app-exception.js";

export class NotFoundException extends AppException {
  constructor(message = "Recurso não encontrado.", details?: unknown) {
    super({
      code: "NOT_FOUND",
      details,
      message,
      statusCode: 404,
    });
  }
}
