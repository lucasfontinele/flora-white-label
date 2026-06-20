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
  organizationId: "org_master",
  profile: "Master" as const,
  guardianId: null,
  patientId: null,
  organizationEmployeeId: null,
};

const context = {
  view: "BackofficeMaster" as const,
  organizationId: "org_master",
  guardianId: null,
  patientId: null,
  organizationEmployeeId: null,
  guardian: null,
  patient: null,
  employee: null,
  managedPatients: [],
};

describe("web GET /api/auth/session", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mocks.getFloraSession.mockReset();
  });

  it("returns the current IronSession summary while the access token is valid", async () => {
    mocks.getFloraSession.mockResolvedValue({
      accessToken: "access_token",
      accessTokenExpiresAt: "2999-06-17T00:15:00.000Z",
      context,
      user,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { context, user } });
  });

  it("clears partial or expired session state", async () => {
    const destroy = vi.fn();
    mocks.getFloraSession.mockResolvedValue({
      accessToken: "old_access",
      accessTokenExpiresAt: "2026-06-17T00:00:00.000Z",
      context,
      destroy,
      user,
    });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: { message: "Sessão ausente." } });
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("rejects anonymous web sessions", async () => {
    mocks.getFloraSession.mockResolvedValue({});

    const response = await GET();

    expect(response.status).toBe(401);
  });
});
