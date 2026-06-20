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
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters."),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
  // Exact origins that are always allowed (e.g. a marketing site).
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  // Base domains whose subdomains (any port/protocol) are allowed. Add client
  // domains here as you point them at the app, e.g. "localhost,flora.app".
  CORS_ALLOWED_ORIGIN_DOMAINS: z
    .string()
    .default("localhost")
    .transform((value) =>
      value
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter((domain) => domain.length > 0),
    ),
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
