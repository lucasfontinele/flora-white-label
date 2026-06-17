import type { LoginResponse } from "@flora/shared/authentication";
import { UnauthorizedException } from "../../exception/index.js";
import { parseLoginCredentials } from "../../domain/authentication/login-credentials.js";
import { userCanAuthenticate } from "../../domain/authentication/user.js";
import { sanitizeAuditMetadata } from "../../domain/authentication/authentication-audit-event.js";
import { authPayloadToResponse } from "./authentication-mappers.js";
import type {
  AuthRequestContext,
  AuthenticationRepository,
  PasswordHasher,
  RefreshTokenHasher,
  TokenService,
} from "./authentication-repository.js";

const invalidCredentialsMessage = "Credenciais inválidas.";

export class LoginUseCase {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly refreshTokenHasher: RefreshTokenHasher,
    private readonly tokenService: TokenService,
    private readonly sessionTtlSeconds = 30 * 24 * 60 * 60,
  ) {}

  async execute(input: unknown, context: AuthRequestContext = {}): Promise<LoginResponse> {
    const credentials = parseLoginCredentials(input);
    const user = await this.authenticationRepository.findUserByEmail(credentials.email);
    const passwordMatches = user
      ? await this.passwordHasher.verify(user.passwordHash, credentials.password)
      : false;

    if (!user || !passwordMatches || !userCanAuthenticate(user)) {
      await this.authenticationRepository.recordAuditEvent({
        emailAttempt: credentials.email,
        ipAddress: context.ipAddress,
        metadata: sanitizeAuditMetadata({ reason: "invalid_credentials" }),
        type: "LOGIN_FAILURE",
        userAgent: context.userAgent,
        userId: user?.id,
      });
      throw new UnauthorizedException(invalidCredentialsMessage);
    }

    const sessionExpiresAt = new Date(Date.now() + this.sessionTtlSeconds * 1000);
    const session = await this.authenticationRepository.createSession({
      expiresAt: sessionExpiresAt,
      ipAddress: context.ipAddress,
      organizationId: user.organizationId,
      userAgent: context.userAgent,
      userId: user.id,
    });
    const sessionAccessToken = await this.tokenService.signAccessToken({
      organizationId: user.organizationId,
      sessionId: session.id,
      type: user.type,
      userId: user.id,
    });
    const sessionRefreshToken = await this.tokenService.signRefreshToken({
      sessionId: session.id,
      userId: user.id,
    });

    await this.authenticationRepository.createRefreshToken({
      expiresAt: sessionRefreshToken.expiresAt,
      sessionId: session.id,
      tokenHash: this.refreshTokenHasher.hash(sessionRefreshToken.token),
    });
    await this.authenticationRepository.updateUserLastLogin(user.id, new Date());
    await this.authenticationRepository.recordAuditEvent({
      ipAddress: context.ipAddress,
      sessionId: session.id,
      type: "LOGIN_SUCCESS",
      userAgent: context.userAgent,
      userId: user.id,
    });

    return authPayloadToResponse({
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      session,
      user,
    });
  }
}
