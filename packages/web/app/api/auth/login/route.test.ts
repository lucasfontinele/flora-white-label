import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getFloraSession: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getFloraSession: mocks.getFloraSession,
}));

const loginResponse = {
  data: {
    session: {
      expiresAt: "2026-07-17T00:00:00.000Z",
      id: "session_1",
      organizationId: null,
      userId: "user_master",
    },
    tokens: {
      accessToken: "access_token",
      accessTokenExpiresAt: "2026-06-17T00:15:00.000Z",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "2026-07-17T00:00:00.000Z",
      tokenType: "Bearer",
    },
    user: {
      email: "master@flora.local",
      id: "user_master",
      organizationId: null,
      type: "MASTER",
    },
  },
};

describe("web POST /api/auth/login", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mocks.getFloraSession.mockReset();
  });

  it("stores token state only in IronSession and returns a safe client summary", async () => {
    const save = vi.fn();
    const session: Record<string, unknown> = { save };
    mocks.getFloraSession.mockResolvedValue(session);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(loginResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        body: JSON.stringify({ email: "master@flora.local", password: "Acesso@123" }),
        headers: {
          "content-type": "application/json",
          "user-agent": "vitest",
          "x-forwarded-for": "127.0.0.1",
        },
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: {
        redirectTo: "/painel",
        session: loginResponse.data.session,
        user: loginResponse.data.user,
      },
    });
    expect(JSON.stringify(body)).not.toContain("access_token");
    expect(JSON.stringify(body)).not.toContain("refresh_token");
    expect(session).toMatchObject({
      accessToken: "access_token",
      accessTokenExpiresAt: "2026-06-17T00:15:00.000Z",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "2026-07-17T00:00:00.000Z",
      session: loginResponse.data.session,
      user: loginResponse.data.user,
    });
    expect(save).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("/auth/login", "http://localhost:3333"),
      expect.objectContaining({
        body: JSON.stringify({ email: "master@flora.local", password: "Acesso@123" }),
        method: "POST",
      }),
    );
  });

  it("does not save session state when the API rejects the login", async () => {
    const save = vi.fn();
    mocks.getFloraSession.mockResolvedValue({ save });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Credenciais inválidas." } }), { status: 401 }),
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        body: JSON.stringify({ email: "master@flora.local", password: "errada" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { message: "Credenciais inválidas." } });
    expect(save).not.toHaveBeenCalled();
  });
});
