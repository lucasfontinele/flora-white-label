import { AppException } from "./app-exception.js";

export class ValidationException extends AppException {
  constructor(message = "Dados inválidos.", details?: unknown) {
    super({
      code: "VALIDATION_ERROR",
      details,
      message,
      statusCode: 400,
    });
  }
}
