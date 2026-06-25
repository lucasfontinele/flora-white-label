import { z } from "zod";

// Produces the body sent to the backoffice subscription-plan API:
// { title, description, priceInCents, patientsLimit, operatorsLimit, unlimitedOperators }.
// When operators are unlimited, operatorsLimit is sent as 0 (the backend will
// ignore it while unlimitedOperators is true).

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
    title: requiredText("Informe o nome do plano."),
    description: z.string().trim().optional(),
    priceInCents: z
      .number({ error: "Informe um preço válido." })
      .int("O preço deve ser um valor inteiro em centavos.")
      .min(0, "O preço não pode ser negativo."),
    patientsLimit: z.preprocess(
      toInteger,
      z
        .number({ error: "Informe o limite de usuários ativos." })
        .int("Use um número inteiro.")
        .positive("Informe um limite maior que zero."),
    ),
    unlimitedOperators: z.boolean(),
    operatorsLimit: z.preprocess(
      toInteger,
      z
        .number({ error: "Informe um número válido." })
        .int("Use um número inteiro.")
        .positive("Informe um limite maior que zero.")
        .optional(),
    ),
  })
  .superRefine((value, context) => {
    if (!value.unlimitedOperators && value.operatorsLimit == null) {
      context.addIssue({
        code: "custom",
        message: "Informe o máximo de operadores para planos limitados.",
        path: ["operatorsLimit"],
      });
    }
  })
  .transform((value) => ({
    title: value.title,
    description: value.description && value.description.length > 0 ? value.description : null,
    priceInCents: value.priceInCents,
    patientsLimit: value.patientsLimit,
    unlimitedOperators: value.unlimitedOperators,
    operatorsLimit: value.unlimitedOperators ? 0 : value.operatorsLimit ?? 0,
  }));

export type SubscriptionPlanPayload = z.output<typeof subscriptionPlanSchema>;
