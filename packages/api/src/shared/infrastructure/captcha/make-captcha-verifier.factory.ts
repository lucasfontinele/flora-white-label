import { env } from "../../../config/env.js";
import type { CaptchaVerifier } from "../../application/captcha/CaptchaVerifier.js";
import { BypassCaptchaVerifier } from "./BypassCaptchaVerifier.js";
import { TurnstileCaptchaVerifier } from "./TurnstileCaptchaVerifier.js";

/**
 * Composition root for the captcha verifier. Returns a real Turnstile verifier
 * (Cloudflare test secret by default, real secret in production) or a bypass
 * verifier when `TURNSTILE_ENABLED=false`.
 */
export function makeCaptchaVerifier(): CaptchaVerifier {
  if (!env.TURNSTILE_ENABLED) {
    return new BypassCaptchaVerifier();
  }

  return new TurnstileCaptchaVerifier({ secretKey: env.TURNSTILE_SECRET_KEY });
}
