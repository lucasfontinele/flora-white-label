import { getFloraSession } from "@/lib/session";

export async function POST() {
  const session = await getFloraSession();
  session.destroy();

  return Response.json({
    data: {
      signedOut: true,
    },
  });
}
