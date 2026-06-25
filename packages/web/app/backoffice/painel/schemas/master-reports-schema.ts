import { z } from "zod";
import { icons, type IconName } from "@/components/ui/icon";

const iconNameSchema = z.custom<IconName>((value) => typeof value === "string" && value in icons, {
  message: "Ícone desconhecido retornado pela API.",
});

export const masterMetricSchema = z.object({
  delta: z.string(),
  hint: z.string(),
  icon: iconNameSchema,
  label: z.string(),
  tone: z.enum(["success", "error"]).optional(),
  value: z.string(),
});

export const masterMonthlyOrganizationsSchema = z.object({
  growthLabel: z.string(),
  points: z.array(z.object({ month: z.string(), value: z.number() })),
});

export const masterPlanDistributionItemSchema = z.object({
  name: z.string(),
  organizations: z.number(),
  percentage: z.number(),
});

export const masterRecentOrganizationSchema = z.object({
  createdAt: z.string(),
  city: z.string(),
  plan: z.string(),
  state: z.string(),
  tradeName: z.string(),
});

export const masterNetworkHealthItemSchema = z.object({
  icon: iconNameSchema,
  label: z.string(),
  value: z.string(),
});

export const masterReportsSchema = z.object({
  metrics: z.array(masterMetricSchema),
  monthlyOrganizations: masterMonthlyOrganizationsSchema,
  networkHealth: z.array(masterNetworkHealthItemSchema),
  planDistribution: z.array(masterPlanDistributionItemSchema),
  recentOrganizations: z.array(masterRecentOrganizationSchema),
  referenceLabel: z.string(),
});

export const getMasterReportsResponseSchema = z.object({
  data: masterReportsSchema,
});
