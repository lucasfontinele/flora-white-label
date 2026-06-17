import { z } from "zod";

// Mirrors the SubscriptionPlan domain (specs/001-organization-registration/data-model.md):
// code/name unique, priceInCents >= 0, maxActiveUsers positive, and maxOperators
// required & positive when `limited`, absent when `unlimited`.

export const operatorLimitTypes = ["limited", "unlimited"] as const;

const requiredText = (message: string) => z.string().trim().min(1, message);

const toInteger = (value: unknown) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
};

export const subscriptionPlanSchema = z
  .object({
    name: requiredText("Informe o nome do plano."),
    code: requiredText("Informe o código do plano.")
      .transform((value) => value.trim().toLowerCase())
      .refine(
        (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        "Use apenas letras minúsculas, números e hífen (ex.: starter).",
      ),
    priceInCents: z
      .number({ error: "Informe um preço válido." })
      .int("O preço deve ser um valor inteiro em centavos.")
      .min(0, "O preço não pode ser negativo."),
    operatorLimitType: z.enum(operatorLimitTypes),
    maxActiveUsers: z.preprocess(
      toInteger,
      z
        .number({ error: "Informe o limite de usuários ativos." })
        .int("Use um número inteiro.")
        .positive("Informe um limite maior que zero."),
    ),
    maxOperators: z.preprocess(
      toInteger,
      z
        .number({ error: "Informe um número válido." })
        .int("Use um número inteiro.")
        .positive("Informe um limite maior que zero.")
        .optional(),
    ),
  })
  .superRefine((value, context) => {
    if (value.operatorLimitType === "limited" && value.maxOperators == null) {
      context.addIssue({
        code: "custom",
        message: "Informe o máximo de operadores para planos limitados.",
        path: ["maxOperators"],
      });
    }
  })
  .transform((value) => ({
    ...value,
    maxOperators: value.operatorLimitType === "unlimited" ? null : value.maxOperators ?? null,
  }));

export type SubscriptionPlanPayload = z.output<typeof subscriptionPlanSchema>;
