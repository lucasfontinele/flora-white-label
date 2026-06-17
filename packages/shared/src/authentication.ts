export type UserType = "MASTER" | "ORGANIZATION" | "STANDARD";

export type AuthenticatedUserDto = {
  email: string;
  id: string;
  organizationId: string | null;
  type: UserType;
};

export type AuthSessionDto = {
  expiresAt: string;
  id: string;
  organizationId: string | null;
  userId: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthTokenPairDto = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: "Bearer";
};

export type LoginResponse = {
  data: {
    session: AuthSessionDto;
    tokens: AuthTokenPairDto;
    user: AuthenticatedUserDto;
  };
};

export type RefreshSessionRequest = {
  refreshToken: string;
};

export type RefreshSessionResponse = LoginResponse;

export type CurrentSessionResponse = {
  data: {
    session: AuthSessionDto;
    user: AuthenticatedUserDto;
  };
};

export type LogoutResponse = {
  data: {
    signedOut: true;
  };
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "INVALID_TOKEN"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZATION_FORBIDDEN";
