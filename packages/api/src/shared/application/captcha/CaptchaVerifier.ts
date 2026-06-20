export interface CaptchaVerificationInput {
  token: string;
  remoteIp?: string;
}

export interface CaptchaVerificationResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Port for verifying a human-interaction token (e.g. Cloudflare Turnstile).
 * Implementations live in the infrastructure layer; the presentation layer uses
 * this to gate sensitive endpoints against bots.
 */
export interface CaptchaVerifier {
  verify(input: CaptchaVerificationInput): Promise<CaptchaVerificationResult>;
}
