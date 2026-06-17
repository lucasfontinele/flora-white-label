import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mocks = vi.hoisted(() => ({
  getFloraSession: vi.fn(),
}));

vi.mock("@/lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session")>();

  return {
    ...actual,
    getFloraSession: mocks.getFloraSession,
  };
});

const user = {
  email: "master@flora.local",
  id: "user_master",
  organizationId: null,
  type: "MASTER",
};

const sessionSummary = {
  expiresAt: "2026-07-17T00:00:00.000Z",
  id: "session_1",
  organizationId: null,
  userId: "user_master",
};

describe("web GET /api/auth/session", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mocks.getFloraSession.mockReset();
  });

  it("returns and persists the current API session while the access token is valid", async () => {
    const save = vi.fn();
    const webSession = {
      accessToken: "access_token",
      accessTokenExpiresAt: "2999-06-17T00:15:00.000Z",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "2999-07-17T00:00:00.000Z",
      save,
      session: sessionSummary,
      user,
    };
    mocks.getFloraSession.mockResolvedValue(webSession);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { session: sessionSummary, user } }), { status: 200 })),
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { session: sessionSummary, user } });
    expect(save).toHaveBeenCalledOnce();
  });

  it("refreshes expired access state and stores rotated tokens", async () => {
    const save = vi.fn();
    const webSession: Record<string, unknown> = {
      accessToken: "old_access",
      accessTokenExpiresAt: "2026-06-17T00:00:00.000Z",
      refreshToken: "old_refresh",
      refreshTokenExpiresAt: "2999-07-17T00:00:00.000Z",
      save,
      session: sessionSummary,
      user,
    };
    mocks.getFloraSession.mockResolvedValue(webSession);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              session: sessionSummary,
              tokens: {
                accessToken: "new_access",
                accessTokenExpiresAt: "2999-06-17T00:15:00.000Z",
                refreshToken: "new_refresh",
                refreshTokenExpiresAt: "2999-07-17T00:00:00.000Z",
                tokenType: "Bearer",
              },
              user,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { session: sessionSummary, user } });
    expect(webSession).toMatchObject({
      accessToken: "new_access",
      refreshToken: "new_refresh",
      session: sessionSummary,
      user,
    });
    expect(save).toHaveBeenCalledOnce();
  });

  it("clears session state when refresh or current-session validation fails", async () => {
    const destroy = vi.fn();
    mocks.getFloraSession.mockResolvedValue({
      accessToken: "old_access",
      accessTokenExpiresAt: "2026-06-17T00:00:00.000Z",
      destroy,
      refreshToken: "old_refresh",
      session: sessionSummary,
      user,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: {} }), { status: 401 })));

    const response = await GET();

    expect(response.status).toBe(401);
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("rejects anonymous web sessions", async () => {
    mocks.getFloraSession.mockResolvedValue({});

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
