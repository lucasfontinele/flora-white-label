import type { LoginResponse } from "@flora/shared/authentication";
import { landingPathForUserType } from "@/lib/auth-redirects";
import { getFloraSession } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await fetch(new URL("/auth/login", apiBaseUrl), {
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "user-agent": request.headers.get("user-agent") ?? "",
      "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
    },
    method: "POST",
  });
  const body = (await response.json()) as LoginResponse | { error?: { message?: string } };

  if (!response.ok || !("data" in body)) {
    const errorBody = body as { error?: { message?: string } };

    return Response.json(
      {
        error: {
          message: errorBody.error?.message ?? "Credenciais inválidas.",
        },
      },
      { status: response.status },
    );
  }

  const session = await getFloraSession();
  session.accessToken = body.data.tokens.accessToken;
  session.accessTokenExpiresAt = body.data.tokens.accessTokenExpiresAt;
  session.refreshToken = body.data.tokens.refreshToken;
  session.refreshTokenExpiresAt = body.data.tokens.refreshTokenExpiresAt;
  session.session = body.data.session;
  session.user = body.data.user;
  await session.save();

  return Response.json({
    data: {
      redirectTo: landingPathForUserType(body.data.user.type),
      session: body.data.session,
      user: body.data.user,
    },
  });
}
