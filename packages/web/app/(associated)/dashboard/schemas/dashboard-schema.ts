import { z } from "zod";

export const dashboardSummarySchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string(),
});
