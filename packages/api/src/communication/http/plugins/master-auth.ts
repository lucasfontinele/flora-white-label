import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenException, UnauthorizedException } from "../../../exception/index.js";

export type MasterUserContext = {
  id: string;
  role: "master";
};

declare module "fastify" {
  interface FastifyRequest {
    masterUser?: MasterUserContext;
    requireMaster(): Promise<MasterUserContext>;
  }
}

export const masterAuthPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("masterUser", undefined);
  app.decorateRequest("requireMaster", async function requireMaster(this: FastifyRequest) {
    const masterUserId = getHeaderValue(this, "x-master-user-id");
    const role = getHeaderValue(this, "x-master-role");

    if (!masterUserId) {
      throw new UnauthorizedException("Autenticação master obrigatória.");
    }

    if (role !== "master") {
      throw new ForbiddenException("Usuário não autorizado como master.");
    }

    this.masterUser = {
      id: masterUserId,
      role: "master",
    };

    return this.masterUser;
  });

  app.addHook("onRequest", async (request) => {
    const masterUserId = getHeaderValue(request, "x-master-user-id");
    const role = getHeaderValue(request, "x-master-role");

    if (masterUserId && role === "master") {
      request.masterUser = {
        id: masterUserId,
        role: "master",
      };
    }
  });
};

export async function requireMaster(request: FastifyRequest, _reply?: FastifyReply) {
  return request.requireMaster();
}

function getHeaderValue(request: FastifyRequest, name: string) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}
