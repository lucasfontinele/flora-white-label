# Shared Type Contract: User Authentication

The shared package will expose authentication DTOs and enums used by
`packages/web` and `packages/api`. Contracts should be exported from
`@flora/shared/authentication` and re-exported from `@flora/shared`.

## Exports

```ts
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

export type RefreshSessionResponse = {
  data: {
    session: AuthSessionDto;
    tokens: AuthTokenPairDto;
    user: AuthenticatedUserDto;
  };
};

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
```

## Rules

- Shared types must not import React, Next.js, Fastify, Prisma, argon2, JWT
  libraries, IronSession, or package-private internals.
- API responses must conform to these DTOs before route handlers return them.
- Web route handlers may consume token-bearing API DTOs, but client components
  must receive only `AuthenticatedUserDto` and `AuthSessionDto`.
- Runtime validation remains package-local: web validates login UX, API
  validates external input and token/session authority.
