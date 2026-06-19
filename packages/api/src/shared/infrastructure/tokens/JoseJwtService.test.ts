import { describe, expect, it } from "vitest";
import { JoseJwtService } from "./JoseJwtService.js";

const secret = "test-secret-with-at-least-32-characters";

describe("JoseJwtService", () => {
  it("signs and verifies a JWT payload", async () => {
    const jwtService = new JoseJwtService({
      secret,
      expiresInSeconds: 900,
    });

    const token = await jwtService.sign({
      sub: "user-1",
      email: "user@example.com",
      profile: "Master",
      organizationId: "org-1",
      guardianId: null,
      patientId: null,
    });

    expect(token).toEqual(expect.any(String));

    const payload = await jwtService.verify(token);

    expect(payload).toMatchObject({
      sub: "user-1",
      email: "user@example.com",
      profile: "Master",
      organizationId: "org-1",
      guardianId: null,
      patientId: null,
    });
    expect(payload.iat).toEqual(expect.any(Number));
    expect(payload.exp).toEqual(expect.any(Number));
  });

  it("rejects tokens signed with another secret", async () => {
    const issuer = new JoseJwtService({
      secret,
      expiresInSeconds: 900,
    });
    const verifier = new JoseJwtService({
      secret: "another-test-secret-with-at-least-32-chars",
      expiresInSeconds: 900,
    });

    const token = await issuer.sign({ sub: "user-1" });

    await expect(verifier.verify(token)).rejects.toThrow();
  });
});
