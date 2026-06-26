import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const requiredInProduction = (name: string, fallback: string) =>
  isProduction ? z.string().min(1, `${name} is required`) : z.string().min(1).default(fallback);

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
  // Cloudflare Turnstile (bot mitigation). Set to "false" to fully bypass the
  // check (offline dev / CI without network).
  TURNSTILE_ENABLED: z
    .string()
    .default("true")
    .transform((value) => value.trim().toLowerCase() !== "false"),
  // Defaults to Cloudflare's "always passes" test secret, so local dev works
  // out of the box. Use the real secret key in production.
  TURNSTILE_SECRET_KEY: z.string().min(1).default("1x0000000000000000000000000000000AA"),
  R2_ACCOUNT_ID: requiredInProduction("R2_ACCOUNT_ID", "local-r2-account"),
  R2_ACCESS_KEY_ID: requiredInProduction("R2_ACCESS_KEY_ID", "local-r2-access-key"),
  R2_SECRET_ACCESS_KEY: requiredInProduction("R2_SECRET_ACCESS_KEY", "local-r2-secret-key"),
  R2_BUCKET_NAME: requiredInProduction("R2_BUCKET_NAME", "local-document-uploads"),
  R2_PRESIGNED_URL_EXPIRES_IN: z.coerce.number().int().positive().default(900),
  MAX_DOCUMENT_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES: z
    .string()
    .default("application/pdf,image/jpeg,image/png")
    .transform((value) =>
      value
        .split(",")
        .map((mimeType) => mimeType.trim().toLowerCase())
        .filter((mimeType) => mimeType.length > 0),
    )
    .refine((value) => value.length > 0, "At least one document upload MIME type is required."),
  // Product cover images share the R2 credentials/bucket above (keys are
  // namespaced per organization/product), but allow only image MIME types and a
  // tighter size limit than documents.
  MAX_PRODUCT_IMAGE_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  PRODUCT_IMAGE_UPLOAD_ALLOWED_MIME_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp")
    .transform((value) =>
      value
        .split(",")
        .map((mimeType) => mimeType.trim().toLowerCase())
        .filter((mimeType) => mimeType.length > 0),
    )
    .refine((value) => value.length > 0, "At least one product image MIME type is required."),
  // AbacatePay payment gateway. The API key is required in production and falls
  // back to a non-functional dev placeholder locally; the secret is never
  // exposed in responses or logs.
  ABACATEPAY_API_KEY: requiredInProduction("ABACATEPAY_API_KEY", "dev-abacatepay-api-key"),
  ABACATEPAY_BASE_URL: z.string().min(1).default("https://api.abacatepay.com/v2"),
  // Public base URL of the web app, used to build links in e-mails (e.g. the
  // employee invitation CTA). No trailing slash.
  WEB_APP_URL: z
    .string()
    .min(1)
    .default("http://localhost:3000")
    .transform((value) => value.replace(/\/+$/, "")),
  // Sender shown on transactional e-mails. Must be a Resend-verified domain
  // (or `onboarding@resend.dev` for testing without a verified domain).
  EMAIL_FROM: z.string().min(1).default("Flora <onboarding@resend.dev>"),
  // Resend API key. When empty, e-mails are logged to the console (dev). When
  // set, e-mails are delivered through Resend. Never exposed in responses/logs.
  RESEND_API_KEY: z.string().default(""),
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
