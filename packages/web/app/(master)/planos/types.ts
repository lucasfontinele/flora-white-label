import type { OperatorLimitType } from "@flora/shared/organizations";

// Local CRUD record for the front-end prototype. When the backend CRUD exists,
// this can be replaced by the shared SubscriptionPlanDto (extended with timestamps).
export type SubscriptionPlanRecord = {
  id: string;
  code: string;
  name: string;
  priceInCents: number;
  operatorLimitType: OperatorLimitType;
  maxActiveUsers: number;
  maxOperators: number | null;
  createdAt: string;
  updatedAt: string;
};

// Form-field shape (numeric fields kept as strings while editing in inputs).
export type PlanFormDraft = {
  name: string;
  code: string;
  priceInCents: number;
  operatorLimitType: OperatorLimitType;
  maxActiveUsers: string;
  maxOperators: string;
};
