import type { RefreshSessionResponse } from "@flora/shared/authentication";
import { UnauthorizedException } from "../../exception/index.js";
import { isRefreshTokenActive } from "../../domain/authentication/refresh-token.js";
import { userCanAuthenticate } from "../../domain/authentication/user.js";
import { isSessionActive } from "../../domain/authentication/user-session.js";
import { authPayloadToResponse } from "./authentication-mappers.js";
import type {
  AuthRequestContext,
  AuthenticationRepository,
  RefreshTokenHasher,
  TokenService,
} from "./authentication-repository.js";

export class RefreshSessionUseCase {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly refreshTokenHasher: RefreshTokenHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string, context: AuthRequestContext = {}, now = new Date()): Promise<RefreshSessionResponse> {
    const claims = await this.tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = this.refreshTokenHasher.hash(refreshToken);
    const result = await this.authenticationRepository.findRefreshTokenByHash(tokenHash);

    if (!result || result.session.id !== claims.sessionId || result.user.id !== claims.userId) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    if (result.refreshToken.status !== "ACTIVE") {
      await this.authenticationRepository.updateRefreshTokenStatus(result.refreshToken.id, "REUSED", now);
      await this.authenticationRepository.revokeSession(result.session.id, "refresh_token_reuse", now);
      await this.authenticationRepository.recordAuditEvent({
        ipAddress: context.ipAddress,
        sessionId: result.session.id,
        type: "REFRESH_REUSE_DETECTED",
        userAgent: context.userAgent,
        userId: result.user.id,
      });
      throw new UnauthorizedException("Sessão inválida.");
    }

    if (!isRefreshTokenActive(result.refreshToken, now) || !isSessionActive(result.session, now) || !userCanAuthenticate(result.user)) {
      await this.authenticationRepository.recordAuditEvent({
        ipAddress: context.ipAddress,
        sessionId: result.session.id,
        type: "REFRESH_FAILURE",
        userAgent: context.userAgent,
        userId: result.user.id,
      });
      throw new UnauthorizedException("Sessão inválida.");
    }

    const accessToken = await this.tokenService.signAccessToken({
      organizationId: result.user.organizationId,
      sessionId: result.session.id,
      type: result.user.type,
      userId: result.user.id,
    });
    const newRefreshToken = await this.tokenService.signRefreshToken({
      sessionId: result.session.id,
      userId: result.user.id,
    });

    await this.authenticationRepository.rotateRefreshToken({
      newToken: {
        expiresAt: newRefreshToken.expiresAt,
        sessionId: result.session.id,
        tokenHash: this.refreshTokenHasher.hash(newRefreshToken.token),
      },
      now,
      previousTokenId: result.refreshToken.id,
    });
    await this.authenticationRepository.extendSession(result.session.id, newRefreshToken.expiresAt, now);
    await this.authenticationRepository.recordAuditEvent({
      ipAddress: context.ipAddress,
      sessionId: result.session.id,
      type: "REFRESH_SUCCESS",
      userAgent: context.userAgent,
      userId: result.user.id,
    });

    return authPayloadToResponse({
      accessToken,
      refreshToken: newRefreshToken,
      session: {
        ...result.session,
        expiresAt: newRefreshToken.expiresAt,
        lastUsedAt: now,
      },
      user: result.user,
    });
  }
}
