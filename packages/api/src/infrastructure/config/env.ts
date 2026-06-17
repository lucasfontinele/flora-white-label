type NodeEnv = "development" | "production" | "test";

export type Env = {
  accessTokenTtlSeconds: number;
  corsOrigins: string[];
  host: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  nodeEnv: NodeEnv;
  port: number;
  refreshTokenTtlSeconds: number;
};

function readNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test") return value;
  return "development";
}

function readPort(value: string | undefined): number {
  if (!value) return 3333;

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }

  return port;
}

function readCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return ["http://localhost:3000", "http://127.0.0.1:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function readPositiveInteger(value: string | undefined, fallback: number, name: string) {
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function readSecret(value: string | undefined, fallback: string, name: string) {
  const secret = value ?? fallback;
  if (secret.length < 32) {
    throw new Error(`${name} must contain at least 32 characters.`);
  }

  return secret;
}

export const env: Env = {
  accessTokenTtlSeconds: readPositiveInteger(
    process.env.JWT_ACCESS_TOKEN_TTL_SECONDS,
    15 * 60,
    "JWT_ACCESS_TOKEN_TTL_SECONDS",
  ),
  corsOrigins: readCorsOrigins(process.env.CORS_ORIGINS),
  host: process.env.HOST ?? "0.0.0.0",
  jwtAccessSecret: readSecret(
    process.env.JWT_ACCESS_SECRET,
    "local-access-secret-change-me-32chars",
    "JWT_ACCESS_SECRET",
  ),
  jwtRefreshSecret: readSecret(
    process.env.JWT_REFRESH_SECRET,
    "local-refresh-secret-change-me-32chars",
    "JWT_REFRESH_SECRET",
  ),
  nodeEnv: readNodeEnv(process.env.NODE_ENV),
  port: readPort(process.env.PORT),
  refreshTokenTtlSeconds: readPositiveInteger(
    process.env.JWT_REFRESH_TOKEN_TTL_SECONDS,
    30 * 24 * 60 * 60,
    "JWT_REFRESH_TOKEN_TTL_SECONDS",
  ),
};
