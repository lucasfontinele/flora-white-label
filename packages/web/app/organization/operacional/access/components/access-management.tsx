import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { permissionMatrix, rolePermissions } from "@/lib/data";
import { cn } from "@/lib/utils";

export function AccessManagement() {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-[var(--green-700)]">Área operacional · administração</p>
          <h2 className="mt-2 text-2xl font-extrabold">Gestão de acessos</h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Defina o que cada perfil de funcionário pode fazer em cada módulo: ver, criar, editar e
            aprovar.
          </p>
        </div>
        <Button>
          <Icon name="user-plus" size={18} />
          Convidar funcionário
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rolePermissions.map((role) => (
          <Card
            key={role.name}
            className={cn(
              "p-5",
              role.selected && "border-[var(--green-500)] bg-primary-subtle shadow-sm",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
                <Icon name={role.icon} size={20} />
              </span>
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-pill border-2",
                  role.selected
                    ? "border-[var(--green-500)] bg-[var(--green-500)] text-white"
                    : "border-[var(--neutral-300)]",
                )}
              >
                {role.selected ? <Icon name="check" size={14} strokeWidth={3} /> : null}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-extrabold">{role.name}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{role.description}</p>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">{role.members} membros</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h3 className="font-heading">Permissões · Operador</h3>
              <p className="text-sm text-[var(--text-secondary)]">Atendimento e fila de pedidos</p>
            </div>
            <Badge tone="petrol">3 membros</Badge>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="bg-muted text-xs font-bold text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3 text-left">Módulo</th>
                  <th className="px-4 py-3">Ver</th>
                  <th className="px-4 py-3">Criar</th>
                  <th className="px-4 py-3">Editar</th>
                  <th className="px-4 py-3">Aprovar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissionMatrix.map((row) => (
                  <tr key={row.module}>
                    <td className="px-4 py-3 font-bold">{row.module}</td>
                    <Permission enabled={row.view} />
                    <Permission enabled={row.create} />
                    <Permission enabled={row.edit} />
                    <Permission enabled={row.approve} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold" htmlFor="invite-email">
                E-mail
              </label>
              <Input id="invite-email" placeholder="nome@vidaverde.org" type="email" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold" htmlFor="invite-role">
                Perfil de acesso
              </label>
              <select
                id="invite-role"
                className="h-11 w-full rounded-md border border-input bg-card px-4 shadow-xs focus:border-[var(--border-focus)]"
                defaultValue="Operador"
              >
                {rolePermissions.map((role) => (
                  <option key={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <Button fullWidth>Enviar convite</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Permission({ enabled }: { enabled: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-sm",
          enabled ? "bg-success-subtle text-[var(--success-600)]" : "bg-muted text-[var(--text-tertiary)]",
        )}
      >
        {enabled ? <Icon name="check" size={15} strokeWidth={3} /> : "-"}
      </span>
    </td>
  );
}
