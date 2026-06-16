import { z } from "zod";

export const profileContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
