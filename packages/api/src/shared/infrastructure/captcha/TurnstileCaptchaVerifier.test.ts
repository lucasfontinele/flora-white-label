import { describe, expect, it, vi } from "vitest";
import { TurnstileCaptchaVerifier } from "./TurnstileCaptchaVerifier.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("TurnstileCaptchaVerifier", () => {
  it("posts the secret and token and returns success", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    const verifier = new TurnstileCaptchaVerifier({
      secretKey: "secret-key",
      baseUrl: "https://turnstile.test/siteverify",
      fetchFn,
    });

    await expect(verifier.verify({ token: "tok-123", remoteIp: "1.2.3.4" })).resolves.toEqual({
      success: true,
      errorCodes: undefined,
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://turnstile.test/siteverify");
    expect(init.method).toBe("POST");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("secret-key");
    expect(body.get("response")).toBe("tok-123");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("returns failure with Cloudflare error codes when the token is invalid", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: false, "error-codes": ["invalid-input-response"] }));
    const verifier = new TurnstileCaptchaVerifier({ secretKey: "secret-key", fetchFn });

    await expect(verifier.verify({ token: "bad" })).resolves.toEqual({
      success: false,
      errorCodes: ["invalid-input-response"],
    });
  });

  it("fails closed on a non-ok response and on transport errors", async () => {
    const httpError = new TurnstileCaptchaVerifier({
      secretKey: "secret-key",
      fetchFn: vi.fn().mockResolvedValue(jsonResponse({}, 500)),
    });
    await expect(httpError.verify({ token: "tok" })).resolves.toMatchObject({ success: false });

    const transportError = new TurnstileCaptchaVerifier({
      secretKey: "secret-key",
      fetchFn: vi.fn().mockRejectedValue(new Error("network down")),
    });
    await expect(transportError.verify({ token: "tok" })).resolves.toEqual({
      success: false,
      errorCodes: ["request-failed"],
    });
  });

  it("rejects an empty token without calling the network", async () => {
    const fetchFn = vi.fn();
    const verifier = new TurnstileCaptchaVerifier({ secretKey: "secret-key", fetchFn });

    await expect(verifier.verify({ token: "" })).resolves.toMatchObject({ success: false });
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
