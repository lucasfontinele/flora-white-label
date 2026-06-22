import multipart from "@fastify/multipart";
import fp from "fastify-plugin";
import { env } from "../../../../../config/env.js";

export const multipartPlugin = fp(
  async (app) => {
    await app.register(multipart, {
      limits: {
        fileSize: env.MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
        files: 1,
      },
    });
  },
  {
    name: "multipart",
  },
);

