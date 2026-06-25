import type {
  CaptchaVerificationInput,
  CaptchaVerificationResult,
  CaptchaVerifier,
} from "../../application/captcha/CaptchaVerifier.js";

interface TurnstileSiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export interface TurnstileCaptchaVerifierOptions {
  secretKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Verifies Cloudflare Turnstile tokens against the siteverify endpoint. Fails
 * closed: any transport/HTTP error resolves to `success: false`, so a provider
 * outage cannot be used to bypass the check.
 */
export class TurnstileCaptchaVerifier implements CaptchaVerifier {
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: TurnstileCaptchaVerifierOptions) {
    this.secretKey = options.secretKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async verify(input: CaptchaVerificationInput): Promise<CaptchaVerificationResult> {
    if (!input.token) {
      return { success: false, errorCodes: ["missing-input-response"] };
    }

    const body = new URLSearchParams({ secret: this.secretKey, response: input.token });
    if (input.remoteIp) {
      body.set("remoteip", input.remoteIp);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        return { success: false, errorCodes: [`http-${response.status}`] };
      }

      const data = (await response.json()) as TurnstileSiteVerifyResponse;

      return { success: data.success === true, errorCodes: data["error-codes"] };
    } catch {
      return { success: false, errorCodes: ["request-failed"] };
    } finally {
      clearTimeout(timeout);
    }
  }
}
