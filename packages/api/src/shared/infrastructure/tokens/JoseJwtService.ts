import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import type { JwtPayload, JwtService } from "../../application/tokens/JwtService.js";

export interface JoseJwtServiceOptions {
  secret: string;
  expiresInSeconds: number;
}

export class JoseJwtService implements JwtService {
  private readonly secret: Uint8Array;
  private readonly expiresInSeconds: number;

  constructor(options: JoseJwtServiceOptions) {
    this.secret = new TextEncoder().encode(options.secret);
    this.expiresInSeconds = options.expiresInSeconds;
  }

  async sign(payload: JwtPayload): Promise<string> {
    return new SignJWT(payload as JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.expiresInSeconds}s`)
      .sign(this.secret);
  }

  async verify<TPayload extends JwtPayload = JwtPayload>(token: string): Promise<TPayload> {
    const { payload } = await jwtVerify(token, this.secret);

    return payload as TPayload;
  }
}
