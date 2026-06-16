type NodeEnv = "development" | "production" | "test";

export type Env = {
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

export const env: Env = {
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: readNodeEnv(process.env.NODE_ENV),
  port: readPort(process.env.PORT),
};
