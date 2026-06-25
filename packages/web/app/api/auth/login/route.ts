import type { LoginResponse } from "@flora/shared/authentication";
import { landingPathForAuthContext } from "@/lib/auth-redirects";
import { getFloraSession, getJwtExpiresAt } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiAuthError = {
  error?: string | { message?: string };
  message?: string;
};

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
  const body = (await response.json()) as LoginResponse | ApiAuthError;

  if (!response.ok || !isLoginResponse(body)) {
    const errorBody = body as ApiAuthError;

    return Response.json(
      {
        error: {
          message: authMessageForStatus(response.status, errorBody),
        },
      },
      { status: response.status },
    );
  }

  const session = await getFloraSession();
  session.accessToken = body.accessToken;
  session.accessTokenExpiresAt = getJwtExpiresAt(body.accessToken);
  session.user = body.user;
  session.context = body.context;
  await session.save();

  return Response.json({
    data: {
      redirectTo: landingPathForAuthContext(body.context),
      user: body.user,
      context: body.context,
    },
  });
}

function isLoginResponse(body: LoginResponse | ApiAuthError): body is LoginResponse {
  return (
    typeof (body as LoginResponse).accessToken === "string" &&
    Boolean((body as LoginResponse).user) &&
    Boolean((body as LoginResponse).context)
  );
}

function authMessageForStatus(status: number, body: ApiAuthError) {
  if (status === 400) return "Revise e-mail e senha.";
  if (status === 401) return "Credenciais inválidas.";
  if (typeof body.error === "object" && body.error?.message) return body.error.message;
  if (body.message && status < 500) return body.message;

  return "Não foi possível entrar agora. Tente novamente.";
}
