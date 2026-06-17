import { purchaseLimits } from "@/lib/data";

// Limites são por associação (portal white-label) + por paciente. A receita só
// vale na organização que a importou, então filtramos por `organizationId`.
// TODO(api): substituir pelo endpoint de limites (receita validada da associação
// + pedidos já realizados no período). Hoje lê o mock co-localizado em lib/data.
export async function getLimits(organizationId: string, patientId?: string) {
  return purchaseLimits.filter(
    (limit) => limit.organizationId === organizationId && (!patientId || limit.patientId === patientId),
  );
}
