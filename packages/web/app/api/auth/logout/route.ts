import { getFloraSession } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function POST() {
  const session = await getFloraSession();

  if (session.accessToken) {
    await fetch(new URL("/auth/logout", apiBaseUrl), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      method: "POST",
    }).catch(() => undefined);
  }

  session.destroy();

  return Response.json({
    data: {
      signedOut: true,
    },
  });
}
