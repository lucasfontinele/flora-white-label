import type { EmailMessage } from "../../../shared/application/email/EmailService.js";

export interface InvitationEmailInput {
  to: string;
  acceptUrl: string;
  organizationName?: string;
}

const SUBJECT = "Flora - Conclua seu cadastro";

/**
 * Builds the employee-invitation e-mail. The CTA points to the web registration
 * screen carrying the invitation token.
 */
export function buildInvitationEmail(input: InvitationEmailInput): EmailMessage {
  const orgLine = input.organizationName
    ? `Você foi convidado para a equipe de ${input.organizationName} na Flora.`
    : "Você foi convidado para a equipe da sua associação na Flora.";

  const text = [
    orgLine,
    "",
    "Para concluir seu cadastro, acesse o link abaixo:",
    input.acceptUrl,
    "",
    "Se você não esperava este convite, ignore este e-mail.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 20px; margin-bottom: 8px;">Conclua seu cadastro na Flora</h1>
      <p style="font-size: 14px; line-height: 1.5; color: #444;">${orgLine}</p>
      <p style="font-size: 14px; line-height: 1.5; color: #444;">
        Clique no botão abaixo para preencher seus dados e ativar seu acesso.
      </p>
      <p style="margin: 24px 0;">
        <a href="${input.acceptUrl}"
           style="background: #16a34a; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Concluir cadastro
        </a>
      </p>
      <p style="font-size: 12px; color: #888;">
        Se o botão não funcionar, copie e cole este endereço no navegador:<br />
        <span style="word-break: break-all;">${input.acceptUrl}</span>
      </p>
      <p style="font-size: 12px; color: #888;">Se você não esperava este convite, ignore este e-mail.</p>
    </div>
  `.trim();

  return { to: input.to, subject: SUBJECT, html, text };
}
