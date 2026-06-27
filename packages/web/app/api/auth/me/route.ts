import type {
  AuthContextDto,
  AuthenticatedUserDto,
  AuthPatientContextDto,
} from "@flora/shared/authentication";
import { getFloraSession, safeSessionSummary, sessionHasAuth } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type MeResponse = {
  user: AuthenticatedUserDto;
  context: AuthContextDto;
};

/**
 * Refreshes the authenticated patient's context. Calls the API `/me`, which
 * re-evaluates each patient's registration status (expired receita / pending
 * documents ⇒ WAITING_DOCUMENTS), persists the fresh context into the session,
 * and reports whether any patient status changed so the client can re-render.
 */
export async function GET() {
  const session = await getFloraSession();

  if (!sessionHasAuth(session) || !session.user) {
    return Response.json({ error: { message: "Sessão ausente." } }, { status: 401 });
  }

  const response = await fetch(new URL("/me", apiBaseUrl), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-user-id": session.user.id,
    },
  });

  if (!response.ok) {
    // Don't tear down the session on a transient failure — just report no change.
    return Response.json({ data: safeSessionSummary(session), changed: false });
  }

  const body = (await response.json()) as MeResponse;
  const previousStatuses = statusMap(session.context);

  session.user = body.user;
  session.context = body.context;
  await session.save();

  const changed = hasStatusChanged(previousStatuses, statusMap(body.context));

  return Response.json({ data: safeSessionSummary(session), changed });
}

function statusMap(context: AuthContextDto | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!context) return map;

  const patients: (AuthPatientContextDto | null)[] = [context.patient, ...context.managedPatients];
  for (const patient of patients) {
    if (patient) map.set(patient.id, patient.patientStatus);
  }
  return map;
}

function hasStatusChanged(previous: Map<string, string>, next: Map<string, string>): boolean {
  if (previous.size !== next.size) return true;
  for (const [id, status] of next) {
    if (previous.get(id) !== status) return true;
  }
  return false;
}
