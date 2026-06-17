import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
