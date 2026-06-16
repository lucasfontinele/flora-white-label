import { z } from "zod";

export const reportRecordSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string(),
  status: z.string(),
});
