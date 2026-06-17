import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import type {
  AuthenticationRepository,
  PasswordHasher,
  RefreshTokenHasher,
  TokenService,
} from "../../../application/authentication/authentication-repository.js";
import { GetCurrentSessionUseCase } from "../../../application/authentication/get-current-session-use-case.js";
import { LoginUseCase } from "../../../application/authentication/login-use-case.js";
import { LogoutUseCase } from "../../../application/authentication/logout-use-case.js";
import { RefreshSessionUseCase } from "../../../application/authentication/refresh-session-use-case.js";
import { UnauthorizedException, ValidationException } from "../../../exception/index.js";
import { PrismaAuthenticationRepository } from "../../../infrastructure/database/prisma-authentication-repository.js";
import { env } from "../../../infrastructure/config/env.js";
import { Argon2PasswordHasher } from "../../../infrastructure/security/argon2-password-hasher.js";
import { JwtTokenService } from "../../../infrastructure/security/jwt-token-service.js";
import { Sha256RefreshTokenHasher } from "../../../infrastructure/security/refresh-token-hasher.js";

export type AuthenticationRoutesOptions = {
  authenticationRepository?: AuthenticationRepository;
  passwordHasher?: PasswordHasher;
  refreshTokenHasher?: RefreshTokenHasher;
  tokenService?: TokenService;
};

export function authenticationRoutes(options: AuthenticationRoutesOptions = {}): FastifyPluginAsync {
  return async (app) => {
    const authenticationRepository = options.authenticationRepository ?? new PrismaAuthenticationRepository();
    const passwordHasher = options.passwordHasher ?? new Argon2PasswordHasher();
    const refreshTokenHasher = options.refreshTokenHasher ?? new Sha256RefreshTokenHasher();
    const tokenService = options.tokenService ?? new JwtTokenService();
    const loginUseCase = new LoginUseCase(
      authenticationRepository,
      passwordHasher,
      refreshTokenHasher,
      tokenService,
      env.refreshTokenTtlSeconds,
    );
    const getCurrentSessionUseCase = new GetCurrentSessionUseCase(authenticationRepository, tokenService);
    const refreshSessionUseCase = new RefreshSessionUseCase(
      authenticationRepository,
      refreshTokenHasher,
      tokenService,
    );
    const logoutUseCase = new LogoutUseCase(authenticationRepository, tokenService);

    app.post("/auth/login", async (request) => {
      return loginUseCase.execute(request.body, requestContext(request));
    });

    app.get("/auth/me", async (request) => {
      return getCurrentSessionUseCase.execute(requireBearerToken(request));
    });

    app.post("/auth/refresh", async (request) => {
      const body = request.body as { refreshToken?: unknown };
      if (typeof body?.refreshToken !== "string" || !body.refreshToken) {
        throw new ValidationException("Refresh token obrigatório.");
      }

      return refreshSessionUseCase.execute(body.refreshToken, requestContext(request));
    });

    app.post("/auth/logout", async (request) => {
      return logoutUseCase.execute(requireBearerToken(request), requestContext(request));
    });
  };
}

function requireBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;

  if (!value?.startsWith("Bearer ")) {
    throw new UnauthorizedException("Sessão inválida.");
  }

  return value.slice("Bearer ".length);
}

function requestContext(request: FastifyRequest) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor ?? request.ip;
  const userAgent = request.headers["user-agent"];

  return {
    ipAddress,
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
  };
}
