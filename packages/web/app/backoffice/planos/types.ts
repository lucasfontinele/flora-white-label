// Shape returned by GET /backoffice/subscription-plans.
export type BackofficeSubscriptionPlan = {
  id: string;
  title: string;
  description: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
  unlimitedOperators: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListBackofficeSubscriptionPlansResponse = {
  data: BackofficeSubscriptionPlan[];
};

// Local CRUD record used by the cards. Mirrors the backend plan shape; records
// created/edited in the prototype reuse the same fields.
export type SubscriptionPlanRecord = {
  id: string;
  title: string;
  description: string | null;
  priceInCents: number;
  patientsLimit: number;
  operatorsLimit: number;
  unlimitedOperators: boolean;
  createdAt: string;
  updatedAt: string;
};

// Form-field shape (numeric fields kept as strings while editing in inputs).
export type PlanFormDraft = {
  title: string;
  description: string;
  priceInCents: number;
  patientsLimit: string;
  unlimitedOperators: boolean;
  operatorsLimit: string;
};
