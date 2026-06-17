import type {
  AuthSessionDto,
  AuthTokenPairDto,
  AuthenticatedUserDto,
  CurrentSessionResponse,
  LoginResponse,
} from "@flora/shared/authentication";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import { userToDto } from "../../domain/authentication/user.js";
import type { UserSession } from "../../domain/authentication/user-session.js";
import { sessionToDto } from "../../domain/authentication/user-session.js";
import type { SignedToken } from "./authentication-repository.js";

export function authPayloadToResponse(input: {
  accessToken: SignedToken;
  refreshToken: SignedToken;
  session: UserSession;
  user: AuthenticationUser;
}): LoginResponse {
  return {
    data: {
      session: sessionToDto(input.session),
      tokens: tokenPairToDto(input.accessToken, input.refreshToken),
      user: userToDto(input.user),
    },
  };
}

export function currentSessionToResponse(input: {
  session: UserSession;
  user: AuthenticationUser;
}): CurrentSessionResponse {
  return {
    data: {
      session: sessionToDto(input.session),
      user: userToDto(input.user),
    },
  };
}

export function tokenPairToDto(accessToken: SignedToken, refreshToken: SignedToken): AuthTokenPairDto {
  return {
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt.toISOString(),
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt.toISOString(),
    tokenType: "Bearer",
  };
}

export type AuthenticatedContextDto = {
  session: AuthSessionDto;
  user: AuthenticatedUserDto;
};
