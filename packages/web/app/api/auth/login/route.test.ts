import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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

const accessToken = makeJwt("2026-06-17T00:15:00.000Z");

const loginResponse = {
  accessToken,
  user: {
    email: "master@flora.local",
    id: "user_master",
    organizationId: "org_master",
    profile: "Master",
    patientId: null,
  },
  context: {
    view: "BackofficeMaster",
    organizationId: "org_master",
    patientId: null,
    organization: {
      id: "org_master",
      tradeName: "Flora",
      legalName: "Flora Plataforma",
      slug: "flora",
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
    },
    guardian: null,
    patient: null,
    employee: null,
    managedPatients: [],
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
        redirectTo: "/backoffice/painel",
        user: loginResponse.user,
        context: loginResponse.context,
      },
    });
    expect(JSON.stringify(body)).not.toContain(accessToken);
    expect(session).toMatchObject({
      accessToken,
      accessTokenExpiresAt: "2026-06-17T00:15:00.000Z",
      user: loginResponse.user,
      context: loginResponse.context,
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
        new Response(JSON.stringify({ error: "AuthenticationError", message: "Invalid credentials." }), { status: 401 }),
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

function makeJwt(expiresAt: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(new Date(expiresAt).getTime() / 1000) }),
  ).toString("base64url");

  return `${header}.${payload}.signature`;
}
