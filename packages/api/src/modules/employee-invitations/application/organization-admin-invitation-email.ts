import type { EmailMessage } from "../../../shared/application/email/EmailService.js";

export interface OrganizationAdminInvitationEmailInput {
  to: string;
  acceptUrl: string;
  organizationName?: string;
}

const SUBJECT = "Flora - Convite de administrador";

/**
 * Builds the organization-admin invitation e-mail. Unlike the regular employee
 * invite, this onboards the organization's master administrator (full access,
 * including managing permissions). The CTA points to the same web registration
 * screen carrying the invitation token.
 */
export function buildOrganizationAdminInvitationEmail(
  input: OrganizationAdminInvitationEmailInput,
): EmailMessage {
  const orgLine = input.organizationName
    ? `Você foi convidado para ser administrador de ${input.organizationName} na Flora.`
    : "Você foi convidado para ser administrador da sua associação na Flora.";

  const text = [
    orgLine,
    "",
    "Como administrador, você terá acesso total ao painel da organização, incluindo a gestão de permissões.",
    "",
    "Para concluir seu cadastro, acesse o link abaixo:",
    input.acceptUrl,
    "",
    "Se você não esperava este convite, ignore este e-mail.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 20px; margin-bottom: 8px;">Conclua seu cadastro de administrador na Flora</h1>
      <p style="font-size: 14px; line-height: 1.5; color: #444;">${orgLine}</p>
      <p style="font-size: 14px; line-height: 1.5; color: #444;">
        Como administrador, você terá acesso total ao painel da organização, incluindo a gestão de permissões.
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
