import { z } from "zod";

/**
 * Validated, typed view of the process environment.
 *
 * Zod is already used across the monorepo, so it is reused here to fail fast
 * with a readable message when a required variable is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");

  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".") || "(root)";
    console.error(`  - ${path}: ${issue.message}`);
  }

  throw new Error("Invalid environment configuration.");
}

export type Env = z.infer<typeof envSchema>;

export const env: Env = parsed.data;
