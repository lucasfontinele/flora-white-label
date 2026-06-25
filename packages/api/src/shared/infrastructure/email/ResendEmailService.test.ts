import { describe, expect, it, vi } from "vitest";
import { ResendEmailService } from "./ResendEmailService.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ResendEmailService", () => {
  it("posts the message to Resend with Bearer auth and the configured sender", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ id: "email-1" }, 200));
    const service = new ResendEmailService({
      apiKey: "re_test",
      from: "Flora <onboarding@resend.dev>",
      fetchFn,
    });

    await service.send({
      to: "person@flora.local",
      subject: "Flora - Conclua seu cadastro",
      html: "<b>hi</b>",
      text: "hi",
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toEqual({
      from: "Flora <onboarding@resend.dev>",
      to: ["person@flora.local"],
      subject: "Flora - Conclua seu cadastro",
      html: "<b>hi</b>",
      text: "hi",
    });
  });

  it("throws when Resend returns a non-ok response", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: "domain not verified" }, 403));
    const service = new ResendEmailService({ apiKey: "re_test", from: "x@y.dev", fetchFn });

    await expect(
      service.send({ to: "a@b.co", subject: "s", html: "<p>h</p>" }),
    ).rejects.toThrow(/Resend responded with status 403/);
  });
});
