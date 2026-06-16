import { ValidationException } from "../../exception/index.js";

export type SubscriptionPlanCode = "starter" | "growth" | "unlimited";
export type OperatorLimitType = "limited" | "unlimited";

export type SubscriptionPlan = {
  code: SubscriptionPlanCode;
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: "Starter" | "Growth" | "Unlimited";
  operatorLimitType: OperatorLimitType;
  priceInCents: number;
};

export function createSubscriptionPlan(input: SubscriptionPlan): SubscriptionPlan {
  const issues: string[] = [];

  if (!Number.isInteger(input.priceInCents) || input.priceInCents < 0) {
    issues.push("Preço deve ser inteiro em centavos.");
  }

  if (!Number.isInteger(input.maxActiveUsers) || input.maxActiveUsers <= 0) {
    issues.push("Limite de usuários ativos deve ser positivo.");
  }

  if (input.operatorLimitType === "limited") {
    if (!Number.isInteger(input.maxOperators) || Number(input.maxOperators) <= 0) {
      issues.push("Limite de operadores deve ser positivo para planos limitados.");
    }
  }

  if (input.operatorLimitType === "unlimited" && input.maxOperators !== null) {
    issues.push("Plano ilimitado não deve definir limite numérico de operadores.");
  }

  if (issues.length > 0) {
    throw new ValidationException("Plano inválido.", issues);
  }

  return input;
}
