import { z } from "zod";
import { icons, type IconName } from "@/components/ui/icon";

const iconNameSchema = z.custom<IconName>((value) => typeof value === "string" && value in icons, {
  message: "Ícone desconhecido retornado pela API.",
});

export const operationalMetricSchema = z.object({
  delta: z.string(),
  hint: z.string(),
  icon: iconNameSchema,
  label: z.string(),
  tone: z.enum(["success", "error"]).optional(),
  value: z.string(),
});

export const operationalOrdersByStatusSchema = z.object({
  count: z.number(),
  status: z.enum([
    "Solicitado",
    "Em análise",
    "Aprovado",
    "Em separação",
    "Pronto para retirada",
    "Enviado",
    "Entregue",
  ]),
});

export const operationalLowStockItemSchema = z.object({
  amount: z.string(),
  name: z.string(),
  tone: z.enum(["success", "warning", "error"]),
});

export const operationalDashboardSchema = z.object({
  lowStock: z.array(operationalLowStockItemSchema),
  metrics: z.array(operationalMetricSchema),
  ordersByStatus: z.array(operationalOrdersByStatusSchema),
  referenceLabel: z.string(),
});

export const getOperationalDashboardResponseSchema = z.object({
  data: operationalDashboardSchema,
});
