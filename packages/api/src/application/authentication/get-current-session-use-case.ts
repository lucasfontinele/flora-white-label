import type { CurrentSessionResponse } from "@flora/shared/authentication";
import { UnauthorizedException } from "../../exception/index.js";
import { isSessionActive } from "../../domain/authentication/user-session.js";
import { userCanAuthenticate } from "../../domain/authentication/user.js";
import { currentSessionToResponse } from "./authentication-mappers.js";
import type { AuthenticationRepository, TokenService } from "./authentication-repository.js";

export class GetCurrentSessionUseCase {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(accessToken: string, now = new Date()): Promise<CurrentSessionResponse> {
    const claims = await this.tokenService.verifyAccessToken(accessToken);
    const result = await this.authenticationRepository.findSessionWithUser(claims.sessionId);

    if (!result || result.user.id !== claims.userId || result.user.organizationId !== claims.organizationId) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    if (!isSessionActive(result.session, now) || !userCanAuthenticate(result.user)) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    return currentSessionToResponse(result);
  }
}
