import type { AuthSessionDto, AuthenticatedUserDto, LoginRequest } from "@flora/shared/authentication";

export type SignInResult = {
  redirectTo: string;
  session: AuthSessionDto;
  user: AuthenticatedUserDto;
};

export async function signIn(input: LoginRequest): Promise<SignInResult> {
  const response = await fetch("/api/auth/login", {
    body: JSON.stringify(input),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const body = (await response.json()) as { data?: SignInResult; error?: { message?: string } };

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Não foi possível entrar.");
  }

  return body.data;
}
