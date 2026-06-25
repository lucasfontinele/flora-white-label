/**
 * Raised when the payment gateway (AbacatePay) is unavailable or returns a
 * transport/HTTP/envelope failure. Carries `statusCode = 502` so the global
 * error handler responds with a Bad Gateway without leaking gateway internals
 * or secrets (messages for >= 500 are replaced by a generic response).
 */
export class PaymentGatewayError extends Error {
  public readonly statusCode = 502;

  constructor(message: string) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

/**
 * Raised when a payment method is not supported by the gateway in this phase
 * (e.g. BOLETO, which the AbacatePay integration does not document). Carries
 * `statusCode = 422` so the client gets a structured, descriptive error.
 */
export class UnsupportedPaymentMethodError extends Error {
  public readonly statusCode = 422;

  constructor(message: string) {
    super(message);
    this.name = "UnsupportedPaymentMethodError";
  }
}
