export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Port for sending transactional e-mail. The concrete transport (SMTP, a
 * provider API, or a dev console logger) lives in the infrastructure layer, so
 * application use cases never depend on a specific mail vendor.
 */
export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}
