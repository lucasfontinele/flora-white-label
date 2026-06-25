import { env } from "../../../config/env.js";
import type { EmailService } from "../../application/email/EmailService.js";
import { ConsoleEmailService } from "./ConsoleEmailService.js";
import { ResendEmailService } from "./ResendEmailService.js";

/**
 * Composition root for the e-mail transport. When `RESEND_API_KEY` is set,
 * e-mails are delivered through Resend; otherwise they are logged to the
 * console (offline dev / CI). Selecting the transport here keeps the use cases
 * free of any vendor detail.
 */
export function makeEmailService(): EmailService {
  if (env.RESEND_API_KEY.length > 0) {
    return new ResendEmailService({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM });
  }

  return new ConsoleEmailService(env.EMAIL_FROM);
}
