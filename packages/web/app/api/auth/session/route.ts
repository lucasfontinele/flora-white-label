import { getFloraSession, safeSessionSummary, sessionHasAuth } from "@/lib/session";

export async function GET() {
  const session = await getFloraSession();

  if (!sessionHasAuth(session)) {
    if (session.accessToken || session.user || session.context) {
      session.destroy();
    }

    return Response.json({ error: { message: "Sessão ausente." } }, { status: 401 });
  }

  return Response.json({ data: safeSessionSummary(session) });
}
