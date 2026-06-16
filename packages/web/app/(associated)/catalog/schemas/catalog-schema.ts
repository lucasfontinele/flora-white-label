import { z } from "zod";

export const catalogItemSchema = z.object({
  name: z.string(),
  category: z.enum(["Flor", "Óleo"]),
  type: z.string(),
  thc: z.string(),
  cbd: z.string(),
  terpenes: z.array(z.string()),
  tags: z.array(z.string()),
});
