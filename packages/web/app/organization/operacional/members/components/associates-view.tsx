"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAssociates, useSetUserAccess } from "../queries/use-associates";
import type { Associate, AssociateFilters, AssociateType } from "../types";

const typeMeta: Record<AssociateType, string> = {
  GUARDIAN: "Responsável",
  PATIENT: "Paciente",
};

const selectClassName =
  "h-11 rounded-md border border-input bg-card px-3 text-sm text-[var(--text-primary)]";

export function AssociatesView({ organizationId }: { organizationId: string }) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<AssociateType | "">("");
  const [status, setStatus] = useState<"" | "active" | "disabled">("");

  // Debounce the name search so each keystroke does not hit the backend.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo<AssociateFilters>(
    () => ({
      search: search || undefined,
      type: type || undefined,
      status: status || undefined,
    }),
    [search, type, status],
  );

  const query = useAssociates(organizationId, filters);
  const accessMutation = useSetUserAccess(organizationId);
  const associates = query.data?.data ?? [];

  function toggleAccess(associate: Associate) {
    const nextActive = !associate.isActive;
    accessMutation.mutate(
      { userId: associate.userId, isActive: nextActive },
      {
        onSuccess: () =>
          toast({
            variant: "success",
            title: nextActive ? "Acesso habilitado" : "Acesso desabilitado",
            description: associate.name,
          }),
      },
    );
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="max-w-2xl">
        <p className="text-sm font-bold text-[var(--green-700)]">Cadastro</p>
        <h2 className="mt-2 text-2xl font-extrabold">Associados</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Responsáveis e pacientes responsáveis por si mesmos. Habilite ou desabilite o acesso de
          cada um.
        </p>
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-80">
          <Input
            aria-label="Buscar por nome"
            placeholder="Buscar paciente ou responsável"
            leadingIcon={<Icon name="search" size={18} />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select
          aria-label="Filtrar por tipo"
          className={selectClassName}
          value={type}
          onChange={(event) => setType(event.target.value as AssociateType | "")}
        >
          <option value="">Todos os tipos</option>
          <option value="GUARDIAN">Responsável</option>
          <option value="PATIENT">Paciente</option>
        </select>
        <select
          aria-label="Filtrar por status"
          className={selectClassName}
          value={status}
          onChange={(event) => setStatus(event.target.value as "" | "active" | "disabled")}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="disabled">Desabilitados</option>
        </select>
      </div>

      {query.isLoading ? (
        <Card>
          <CardContent className="p-0">
            <AssociatesTableShell>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} aria-busy="true" className="bg-card">
                  {Array.from({ length: 6 }).map((__, cell) => (
                    <td key={cell} className="px-5 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </AssociatesTableShell>
          </CardContent>
        </Card>
      ) : query.error ? (
        <Card>
          <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-heading text-lg text-[var(--text-primary)]">
                Não foi possível carregar os associados
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {query.error instanceof Error ? query.error.message : "Tente novamente."}
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : associates.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <h3 className="font-heading text-lg text-[var(--text-primary)]">
              Nenhum associado encontrado
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Ajuste os filtros ou aguarde novos cadastros.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <AssociatesTableShell>
              {associates.map((associate) => {
                const togglePending =
                  accessMutation.isPending && accessMutation.variables?.userId === associate.userId;

                return (
                  <tr key={associate.userId} className="bg-card align-top">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text-primary)]">{associate.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={associate.type === "GUARDIAN" ? "primary" : "info"} size="sm">
                        {typeMeta[associate.type]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {associate.patientNames.length > 0 ? associate.patientNames.join(", ") : "—"}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">{associate.email}</td>
                    <td className="px-5 py-4">
                      <Badge tone={associate.isActive ? "success" : "neutral"} dot>
                        {associate.isActive ? "Ativo" : "Desabilitado"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <Button
                          aria-label={`${associate.isActive ? "Desabilitar" : "Habilitar"} acesso de ${associate.name}`}
                          size="sm"
                          type="button"
                          variant={associate.isActive ? "ghost" : "secondary"}
                          disabled={togglePending}
                          onClick={() => toggleAccess(associate)}
                        >
                          {togglePending
                            ? "Salvando..."
                            : associate.isActive
                              ? "Desabilitar acesso"
                              : "Habilitar acesso"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </AssociatesTableShell>
            <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
              {associates.length} {associates.length === 1 ? "associado" : "associados"}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssociatesTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Associado</th>
            <th className="px-5 py-3 font-semibold">Tipo</th>
            <th className="px-5 py-3 font-semibold">Pacientes</th>
            <th className="px-5 py-3 font-semibold">E-mail</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
