export type JwtPayload = Record<string, unknown>;

export interface JwtService {
  sign(payload: JwtPayload): Promise<string>;
  verify<TPayload extends JwtPayload = JwtPayload>(token: string): Promise<TPayload>;
}
