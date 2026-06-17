import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserType } from "@flora/shared/authentication";

export type AuthorizationOptions = {
  allowedUserTypes?: UserType[];
};

export function Authorization(options: AuthorizationOptions = {}) {
  return async function authorizationPreHandler(request: FastifyRequest, _reply: FastifyReply) {
    await request.requireAuthentication(options);
  };
}
