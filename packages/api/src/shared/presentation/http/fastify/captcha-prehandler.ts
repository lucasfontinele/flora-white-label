import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import type { CaptchaVerifier } from "../../../application/captcha/CaptchaVerifier.js";

const CAPTCHA_HEADER = "x-captcha-token";

function readToken(request: FastifyRequest): string | undefined {
  const header = request.headers[CAPTCHA_HEADER];
  const value = Array.isArray(header) ? header[0] : header;

  return value && value.trim().length > 0 ? value : undefined;
}

/**
 * Builds a Fastify preHandler that rejects a request unless it carries a valid
 * captcha token (sent in the `x-captcha-token` header). Mitigates automated
 * abuse on public, unauthenticated endpoints.
 */
export function makeCaptchaPreHandler(verifier: CaptchaVerifier): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = readToken(request);

    if (!token) {
      return reply.status(400).send({
        error: "CaptchaError",
        message: "Captcha token is required.",
      });
    }

    const result = await verifier.verify({ token, remoteIp: request.ip });

    if (!result.success) {
      return reply.status(403).send({
        error: "CaptchaError",
        message: "Captcha verification failed.",
      });
    }
  };
}
