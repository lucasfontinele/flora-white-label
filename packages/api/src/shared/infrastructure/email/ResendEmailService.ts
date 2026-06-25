import type { EmailMessage, EmailService } from "../../application/email/EmailService.js";

export interface ResendEmailServiceOptions {
  apiKey: string;
  from: string;
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://api.resend.com";
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Delivers transactional e-mail through the Resend API. The API key is sent as
 * a Bearer token and never returned or logged. Mirrors the outbound-HTTP shape
 * of the other infrastructure adapters (injectable fetch, timeout via
 * AbortController). Failures throw so the caller can react.
 */
export class ResendEmailService implements EmailService {
  private readonly apiKey: string;
  private readonly from: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: ResendEmailServiceOptions) {
    this.apiKey = options.apiKey;
    this.from = options.from;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async send(message: EmailMessage): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(`${this.baseUrl}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          ...(message.text ? { text: message.text } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await this.readErrorMessage(response);
        throw new Error(`Resend responded with status ${response.status}: ${detail}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readErrorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { message?: string; name?: string };
      return body.message ?? body.name ?? "unknown error";
    } catch {
      return "unknown error";
    }
  }
}
