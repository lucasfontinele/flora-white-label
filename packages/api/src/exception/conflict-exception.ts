import { AppException } from "./app-exception.js";

export class ConflictException extends AppException {
  constructor(message = "Conflito ao processar a solicitação.", details?: unknown) {
    super({
      code: "CONFLICT",
      details,
      message,
      statusCode: 409,
    });
  }
}
