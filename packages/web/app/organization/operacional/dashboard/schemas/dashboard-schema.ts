import { z } from "zod";

export const operationalMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string(),
  hint: z.string(),
});
