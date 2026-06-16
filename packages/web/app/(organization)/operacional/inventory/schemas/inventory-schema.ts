import { z } from "zod";

export const inventoryRecordSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string(),
  status: z.string(),
});
