"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import { cn } from "@/lib/utils";
import { usePermissions } from "../../../permissions/permissions-context";
import { InvitePanel } from "./invite-panel";
import { PermissionMatrix } from "./permission-matrix";
import { useRoles, useSetRolePermissions } from "../queries/use-access";
import {
  permissionKey,
  ROLE_ICONS,
  type PermissionAction,
  type PermissionModule,
  type Role,
} from "../types";

function toKeySet(role: Role): Set<string> {
  return new Set(role.permissions.map((permission) => permissionKey(permission.module, permission.action)));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function AccessView({ organizationId }: { organizationId: string }) {
  const { toast } = useToast();
  const { can } = usePermissions();
  const canEditAccess = can("ACCESS", "EDIT");
  const query = useRoles(organizationId);
  const setMutation = useSetRolePermissions(organizationId);

  const roles = useMemo(() => query.data?.data ?? [], [query.data]);
  const catalog = query.data?.catalog;

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;

  const [draft, setDraft] = useState<Set<string>>(new Set());

  // Reset the editable grid whenever the selected role (or its server-side
  // permissions after a save) changes.
  useEffect(() => {
    if (selectedRole) {
      setDraft(toKeySet(selectedRole));
    }
  }, [selectedRole]);

  const dirty = useMemo(
    () => (selectedRole ? !setsEqual(draft, toKeySet(selectedRole)) : false),
    [draft, selectedRole],
  );

  function toggle(module: PermissionModule, action: PermissionAction) {
    if (selectedRole?.fullAccess || !canEditAccess) return;

    const key = permissionKey(module, action);
    setDraft((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function save() {
    if (!selectedRole) return;

    const permissions = [...draft].map((key) => {
      const [module, action] = key.split(":") as [PermissionModule, PermissionAction];
      return { module, action };
    });

    setMutation.mutate(
      { roleId: selectedRole.id, permissions },
      {
        onSuccess: () =>
          toast({
            variant: "success",
            title: "Permissões atualizadas",
            description: `As permissões do perfil ${selectedRole.name} foram salvas.`,
          }),
        onError: (error) =>
          toast({
            variant: "error",
            title: "Algo deu errado",
            description: getApiErrorMessage(error),
          }),
      },
    );
  }

  if (query.isLoading) {
    return <AccessSkeleton />;
  }

  if (query.error) {
    return (
      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-lg">Não foi possível carregar os perfis de acesso</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {getApiErrorMessage(query.error)}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  const assignableRoles = roles.filter((role) => !role.fullAccess);

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="max-w-3xl">
        <p className="text-sm font-bold text-[var(--green-700)]">Área operacional · administração</p>
        <h2 className="mt-2 text-2xl font-extrabold">Gestão de acessos</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Defina o que cada perfil de funcionário pode fazer em cada módulo: ver, criar, editar e
          aprovar.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => {
          const active = role.id === selectedRole?.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={cn(
                "rounded-md border bg-card p-5 text-left transition-colors",
                active
                  ? "border-[var(--green-500)] bg-primary-subtle shadow-sm"
                  : "border-border hover:border-primary-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
                  <Icon name={ROLE_ICONS[role.key ?? ""] ?? "user"} size={20} />
                </span>
                {active ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-pill border-2 border-[var(--green-500)] bg-[var(--green-500)] text-white">
                    <Icon name="check" size={14} strokeWidth={3} />
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 text-lg font-extrabold">{role.name}</h3>
              {role.description ? (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{role.description}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">
                  {role.membersCount} {role.membersCount === 1 ? "membro" : "membros"}
                </span>
                {role.fullAccess ? (
                  <Badge tone="petrol" size="sm">
                    Acesso total
                  </Badge>
                ) : null}
                {role.viewAll ? (
                  <Badge tone="info" size="sm">
                    Vê tudo
                  </Badge>
                ) : null}
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h3 className="font-heading">Permissões · {selectedRole?.name ?? "—"}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {selectedRole?.fullAccess
                  ? "Este perfil tem acesso total e não pode ser editado."
                  : canEditAccess
                    ? "Marque ou desmarque cada permissão e salve."
                    : "Você pode visualizar, mas não tem permissão para editar perfis."}
              </p>
            </div>
            {selectedRole && !selectedRole.fullAccess && canEditAccess ? (
              <Button
                type="button"
                size="sm"
                disabled={!dirty || setMutation.isPending}
                onClick={save}
              >
                {setMutation.isPending ? "Salvando..." : "Salvar permissões"}
              </Button>
            ) : null}
          </div>

          {selectedRole && catalog ? (
            <PermissionMatrix
              role={selectedRole}
              catalog={catalog}
              selected={draft}
              disabled={setMutation.isPending || !canEditAccess}
              onToggle={toggle}
            />
          ) : null}
        </Card>

        <InvitePanel organizationId={organizationId} roles={assignableRoles} />
      </section>
    </div>
  );
}

function AccessSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16 w-full max-w-md" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
