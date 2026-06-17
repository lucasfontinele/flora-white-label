import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({
  getFloraSession: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getFloraSession: mocks.getFloraSession,
}));

describe("web POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mocks.getFloraSession.mockReset();
  });

  it("invalidates the API session when present and clears IronSession", async () => {
    const destroy = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { signedOut: true } }), { status: 200 }));
    mocks.getFloraSession.mockResolvedValue({ accessToken: "access_token", destroy });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { signedOut: true } });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://localhost:3333/auth/logout");
    expect(init).toMatchObject({
      headers: {
        Accept: "application/json",
        Authorization: "Bearer access_token",
      },
      method: "POST",
    });
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("clears IronSession even without an API access token", async () => {
    const destroy = vi.fn();
    const fetchMock = vi.fn();
    mocks.getFloraSession.mockResolvedValue({ destroy });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST();

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
