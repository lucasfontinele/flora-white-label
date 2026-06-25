import { InviteRegistration } from "./invite-registration";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InviteRegistration token={token} />;
}
