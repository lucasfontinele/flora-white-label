import type {
  CaptchaVerificationResult,
  CaptchaVerifier,
} from "../../application/captcha/CaptchaVerifier.js";

/**
 * No-op verifier that always succeeds. Used when the captcha is disabled
 * (offline dev / CI). Never select this in production.
 */
export class BypassCaptchaVerifier implements CaptchaVerifier {
  async verify(): Promise<CaptchaVerificationResult> {
    return { success: true };
  }
}
