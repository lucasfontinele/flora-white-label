import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import type {
  AccessTokenClaims,
  RefreshTokenClaims,
  SignedToken,
  TokenService,
} from "../../application/authentication/authentication-repository.js";
import { UnauthorizedException } from "../../exception/index.js";
import { env } from "../config/env.js";

type JwtTokenServiceOptions = {
  accessSecret?: string;
  accessTokenTtlSeconds?: number;
  refreshSecret?: string;
  refreshTokenTtlSeconds?: number;
};

const encoder = new TextEncoder();

export class JwtTokenService implements TokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;

  constructor(options: JwtTokenServiceOptions = {}) {
    this.accessSecret = encoder.encode(options.accessSecret ?? env.jwtAccessSecret);
    this.refreshSecret = encoder.encode(options.refreshSecret ?? env.jwtRefreshSecret);
    this.accessTokenTtlSeconds = options.accessTokenTtlSeconds ?? env.accessTokenTtlSeconds;
    this.refreshTokenTtlSeconds = options.refreshTokenTtlSeconds ?? env.refreshTokenTtlSeconds;
  }

  async signAccessToken(input: Omit<AccessTokenClaims, "tokenId">): Promise<SignedToken> {
    const tokenId = randomUUID();
    const expiresAt = secondsFromNow(this.accessTokenTtlSeconds);
    const token = await new SignJWT({
      org: input.organizationId,
      sid: input.sessionId,
      typ: input.type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setJti(tokenId)
      .setSubject(input.userId)
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.accessSecret);

    return { expiresAt, token, tokenId };
  }

  async signRefreshToken(input: Omit<RefreshTokenClaims, "tokenId">): Promise<SignedToken> {
    const tokenId = randomUUID();
    const expiresAt = secondsFromNow(this.refreshTokenTtlSeconds);
    const token = await new SignJWT({
      sid: input.sessionId,
      tokenUse: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setJti(tokenId)
      .setSubject(input.userId)
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.refreshSecret);

    return { expiresAt, token, tokenId };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      const userId = readString(payload.sub);
      const sessionId = readString(payload.sid);
      const tokenId = readString(payload.jti);
      const type = readString(payload.typ);
      const organizationId = typeof payload.org === "string" ? payload.org : null;

      if (!userId || !sessionId || !tokenId || !isUserType(type)) {
        throw new Error("Invalid access claims.");
      }

      return {
        organizationId,
        sessionId,
        tokenId,
        type,
        userId,
      };
    } catch {
      throw new UnauthorizedException("Sessão inválida.");
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret);
      const userId = readString(payload.sub);
      const sessionId = readString(payload.sid);
      const tokenId = readString(payload.jti);

      if (!userId || !sessionId || !tokenId || payload.tokenUse !== "refresh") {
        throw new Error("Invalid refresh claims.");
      }

      return { sessionId, tokenId, userId };
    } catch {
      throw new UnauthorizedException("Sessão inválida.");
    }
  }
}

function secondsFromNow(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isUserType(value: string): value is AccessTokenClaims["type"] {
  return value === "MASTER" || value === "ORGANIZATION" || value === "STANDARD";
}
