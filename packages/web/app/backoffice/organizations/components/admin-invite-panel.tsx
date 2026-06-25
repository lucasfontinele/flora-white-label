"use client";

import { useState } from "react";
import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import {
  useAdminInvitations,
  useResendAdminInvitation,
  useSendAdminInvitation,
} from "../queries/use-admin-invitations";
import { INVITATION_STATUS_LABELS, type InvitationStatus } from "../types";

const statusTone: Record<InvitationStatus, NonNullable<BadgeProps["tone"]>> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "neutral",
  REVOKED: "error",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function AdminInvitePanel({
  organizationId,
  masterUserId,
}: {
  organizationId: string;
  masterUserId: string;
}) {
  const { toast } = useToast();
  const sendMutation = useSendAdminInvitation(organizationId, masterUserId);
  const resendMutation = useResendAdminInvitation(organizationId, masterUserId);
  const invitations = useAdminInvitations(organizationId, masterUserId);

  const [email, setEmail] = useState("");

  function notifyError(error: unknown) {
    toast({ variant: "error", title: "Algo deu errado", description: getApiErrorMessage(error) });
  }

  function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed.length === 0) return;

    sendMutation.mutate(
      { email: trimmed },
      {
        onSuccess: (invitation) => {
          setEmail("");
          toast({
            variant: "success",
            title: "Convite enviado",
            description: `Enviamos um convite de administrador para ${invitation.email}.`,
          });
        },
        onError: notifyError,
      },
    );
  }

  function resend(invitationId: string, invitedEmail: string) {
    resendMutation.mutate(invitationId, {
      onSuccess: () =>
        toast({
          variant: "success",
          title: "Convite reenviado",
          description: `Um novo link foi enviado para ${invitedEmail}.`,
        }),
      onError: notifyError,
    });
  }

  const rows = invitations.data?.data ?? [];

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="mb-5 flex items-start gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name="shield-check" size={22} />
          </span>
          <div>
            <h3 className="font-heading">Convidar administrador master</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Enviamos um convite por e-mail. O convidado terá acesso total ao painel da
              organização, incluindo a gestão de permissões.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submitInvite}>
          <div className="space-y-1.5">
            <label className="text-sm font-bold" htmlFor="admin-invite-email">
              E-mail
            </label>
            <Input
              id="admin-invite-email"
              type="email"
              placeholder="admin@associacao.org"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leadingIcon={<Icon name="mail" size={18} />}
            />
          </div>

          <Button
            fullWidth
            type="submit"
            disabled={sendMutation.isPending || email.trim().length === 0}
          >
            {sendMutation.isPending ? "Enviando..." : "Enviar convite"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="font-heading">Convites enviados</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Acompanhe e reenvie convites de administrador pendentes.
          </p>
        </div>

        {invitations.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">
            Nenhum convite de administrador enviado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((invitation) => (
              <li key={invitation.id} className="flex flex-wrap items-center gap-3 p-4 px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{invitation.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {invitation.roleName} · expira em{" "}
                    {dateFormatter.format(new Date(invitation.expiresAt))}
                  </p>
                </div>
                <Badge tone={statusTone[invitation.status]} size="sm" dot>
                  {INVITATION_STATUS_LABELS[invitation.status]}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  disabled={invitation.status === "ACCEPTED" || resendMutation.isPending}
                  onClick={() => resend(invitation.id, invitation.email)}
                >
                  Reenviar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
