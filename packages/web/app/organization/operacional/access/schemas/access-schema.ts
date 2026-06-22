import { z } from "zod";

export const accessRoleSchema = z.object({
  name: z.string(),
  description: z.string(),
  members: z.number(),
});
