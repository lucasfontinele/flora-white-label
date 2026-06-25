import Fastify from "fastify";
import { describe, expect, it, vi } from "vitest";
import type { CaptchaVerifier } from "../../../application/captcha/CaptchaVerifier.js";
import { makeCaptchaPreHandler } from "./captcha-prehandler.js";

function buildApp(verifier: CaptchaVerifier) {
  const app = Fastify();
  app.post("/protected", { preHandler: makeCaptchaPreHandler(verifier) }, async () => ({ ok: true }));
  return app;
}

describe("makeCaptchaPreHandler", () => {
  it("rejects with 400 when the captcha token header is missing", async () => {
    const verify = vi.fn();
    const app = buildApp({ verify });

    const response = await app.inject({ method: "POST", url: "/protected", payload: {} });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("CaptchaError");
    expect(verify).not.toHaveBeenCalled();
    await app.close();
  });

  it("rejects with 403 when verification fails", async () => {
    const app = buildApp({ verify: vi.fn().mockResolvedValue({ success: false }) });

    const response = await app.inject({
      method: "POST",
      url: "/protected",
      headers: { "x-captcha-token": "bad-token" },
      payload: {},
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toBe("Captcha verification failed.");
    await app.close();
  });

  it("passes the token and client IP through and allows the request on success", async () => {
    const verify = vi.fn().mockResolvedValue({ success: true });
    const app = buildApp({ verify });

    const response = await app.inject({
      method: "POST",
      url: "/protected",
      headers: { "x-captcha-token": "good-token" },
      payload: {},
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    expect(verify).toHaveBeenCalledWith(expect.objectContaining({ token: "good-token" }));
    await app.close();
  });
});
