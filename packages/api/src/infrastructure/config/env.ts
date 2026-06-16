type NodeEnv = "development" | "production" | "test";

export type Env = {
  corsOrigins: string[];
  host: string;
  nodeEnv: NodeEnv;
  port: number;
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

export const env: Env = {
  corsOrigins: readCorsOrigins(process.env.CORS_ORIGINS),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: readNodeEnv(process.env.NODE_ENV),
  port: readPort(process.env.PORT),
};
