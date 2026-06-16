import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { env } from "../../../infrastructure/config/env.js";

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;

export async function registerCors(app: FastifyInstance) {
  await app.register(fastifyCors, {
    allowedHeaders: ["Accept", "Content-Type", "x-master-role", "x-master-user-id"],
    methods: ["GET", "POST", "OPTIONS"],
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  });
}

function isAllowedOrigin(origin: string) {
  if (env.corsOrigins.includes("*")) return true;
  if (env.corsOrigins.includes(origin)) return true;

  return env.nodeEnv !== "production" && localOriginPattern.test(origin);
}
