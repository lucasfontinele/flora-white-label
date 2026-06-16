import "dotenv/config";
import { buildServer } from "./communication/http/build-server.js";
import { env } from "./infrastructure/config/env.js";
import { disconnectPrisma } from "./infrastructure/database/prisma-client.js";

async function bootstrap() {
  const app = await buildServer();

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, "Shutting down API.");
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await app.listen({
    host: env.host,
    port: env.port,
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
