import type { LogoutResponse } from "@flora/shared/authentication";
import { UnauthorizedException } from "../../exception/index.js";
import type {
  AuthRequestContext,
  AuthenticationRepository,
  TokenService,
} from "./authentication-repository.js";

export class LogoutUseCase {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(accessToken: string, context: AuthRequestContext = {}, now = new Date()): Promise<LogoutResponse> {
    const claims = await this.tokenService.verifyAccessToken(accessToken);
    const result = await this.authenticationRepository.findSessionWithUser(claims.sessionId);

    if (!result || result.user.id !== claims.userId) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    if (result.session.status === "ACTIVE") {
      await this.authenticationRepository.revokeSession(result.session.id, "logout", now);
      await this.authenticationRepository.revokeRefreshTokensForSession(result.session.id, now);
    }

    await this.authenticationRepository.recordAuditEvent({
      ipAddress: context.ipAddress,
      sessionId: result.session.id,
      type: "LOGOUT",
      userAgent: context.userAgent,
      userId: result.user.id,
    });

    return {
      data: {
        signedOut: true,
      },
    };
  }
}
