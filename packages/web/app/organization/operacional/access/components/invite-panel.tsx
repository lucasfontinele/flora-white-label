"use client";

import { useState } from "react";
import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import { usePermissions } from "../../../permissions/permissions-context";
import { useInvitations, useResendInvitation, useSendInvitation } from "../queries/use-access";
import { INVITATION_STATUS_LABELS, type InvitationStatus, type Role } from "../types";

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

export function InvitePanel({
  organizationId,
  roles,
}: {
  organizationId: string;
  roles: Role[];
}) {
  const { toast } = useToast();
  const { can } = usePermissions();
  const canInvite = can("ACCESS", "CREATE");
  const sendMutation = useSendInvitation(organizationId);
  const resendMutation = useResendInvitation(organizationId);
  const invitations = useInvitations(organizationId);

  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");

  function notifyError(error: unknown) {
    toast({ variant: "error", title: "Algo deu errado", description: getApiErrorMessage(error) });
  }

  function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed.length === 0 || roleId.length === 0) return;

    sendMutation.mutate(
      { email: trimmed, roleId },
      {
        onSuccess: (invitation) => {
          setEmail("");
          toast({
            variant: "success",
            title: "Convite enviado",
            description: `Enviamos um convite para ${invitation.email}.`,
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
            <Icon name="user-plus" size={22} />
          </span>
          <div>
            <h3 className="font-heading">Convidar funcionário</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Enviamos um convite por e-mail. O acesso segue o perfil escolhido.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submitInvite}>
          <div className="space-y-1.5">
            <label className="text-sm font-bold" htmlFor="invite-email">
              E-mail
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nome@associacao.org"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leadingIcon={<Icon name="mail" size={18} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold" htmlFor="invite-role">
              Perfil de acesso
            </label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger id="invite-role" aria-label="Perfil de acesso">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            fullWidth
            type="submit"
            disabled={
              !canInvite ||
              sendMutation.isPending ||
              email.trim().length === 0 ||
              roleId.length === 0
            }
          >
            {sendMutation.isPending ? "Enviando..." : "Enviar convite"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
          <h3 className="font-heading">Convites enviados</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Acompanhe e reenvie convites pendentes.
          </p>
        </div>

        {invitations.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">Nenhum convite enviado ainda.</p>
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
                  disabled={
                    !canInvite || invitation.status === "ACCEPTED" || resendMutation.isPending
                  }
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
