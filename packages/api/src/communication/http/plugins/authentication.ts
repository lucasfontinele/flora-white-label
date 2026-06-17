import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import type { AuthenticatedUserDto, AuthSessionDto, UserType } from "@flora/shared/authentication";
import type { AuthenticationRepository, TokenService } from "../../../application/authentication/authentication-repository.js";
import { currentSessionToResponse } from "../../../application/authentication/authentication-mappers.js";
import { isSessionActive } from "../../../domain/authentication/user-session.js";
import { userCanAuthenticate } from "../../../domain/authentication/user.js";
import { ForbiddenException, UnauthorizedException } from "../../../exception/index.js";
import { PrismaAuthenticationRepository } from "../../../infrastructure/database/prisma-authentication-repository.js";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token-service.js";

export type AuthenticatedRequestContext = {
  session: AuthSessionDto;
  user: AuthenticatedUserDto;
};

export type AuthenticationPluginOptions = {
  authenticationRepository?: AuthenticationRepository;
  tokenService?: TokenService;
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthenticatedRequestContext;
    requireAuthentication(options?: { allowedUserTypes?: UserType[] }): Promise<AuthenticatedRequestContext>;
  }
}

export const authenticationPlugin: FastifyPluginAsync<AuthenticationPluginOptions> = async (app, options) => {
  const authenticationRepository = options.authenticationRepository ?? new PrismaAuthenticationRepository();
  const tokenService = options.tokenService ?? new JwtTokenService();

  app.decorateRequest("auth", undefined);
  app.decorateRequest("requireAuthentication", async function requireAuthentication(
    this: FastifyRequest,
    authOptions: { allowedUserTypes?: UserType[] } = {},
  ) {
    const token = readBearerToken(this);
    const claims = await tokenService.verifyAccessToken(token);
    const result = await authenticationRepository.findSessionWithUser(claims.sessionId);

    if (!result || result.user.id !== claims.userId || result.user.organizationId !== claims.organizationId) {
      throw new UnauthorizedException("Autenticação obrigatória.");
    }

    if (!isSessionActive(result.session) || !userCanAuthenticate(result.user)) {
      throw new UnauthorizedException("Autenticação obrigatória.");
    }

    if (authOptions.allowedUserTypes?.length && !authOptions.allowedUserTypes.includes(result.user.type)) {
      throw new ForbiddenException("Usuário não autorizado.");
    }

    const auth = currentSessionToResponse(result).data;
    this.auth = auth;
    return auth;
  });
};

export function requireAuthentication(request: FastifyRequest, _reply?: FastifyReply) {
  return request.requireAuthentication();
}

function readBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;

  if (!value?.startsWith("Bearer ")) {
    throw new UnauthorizedException("Autenticação obrigatória.");
  }

  return value.slice("Bearer ".length);
}
