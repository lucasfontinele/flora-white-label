import type { EmailMessage, EmailService } from "../../application/email/EmailService.js";

/**
 * Development e-mail transport that logs the message instead of delivering it.
 * Use it locally / in CI where no SMTP provider is configured. Never select it
 * in production. Mirrors the bypass philosophy of the captcha verifier.
 */
export class ConsoleEmailService implements EmailService {
  constructor(private readonly from: string) {}

  async send(message: EmailMessage): Promise<void> {
    console.info("[email] (dev console transport) ──────────────────────────");
    console.info("[email] from:    %s", this.from);
    console.info("[email] to:      %s", message.to);
    console.info("[email] subject: %s", message.subject);
    console.info("[email] text:\n%s", message.text ?? message.html);
    console.info("[email] ────────────────────────────────────────────────");
  }
}
