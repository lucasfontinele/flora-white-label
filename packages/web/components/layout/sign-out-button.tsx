"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type SignOutButtonProps = {
  inverse?: boolean;
};

export function SignOutButton({ inverse }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
    }).catch(() => undefined);
    router.push("/entrar");
    router.refresh();
  }

  return (
    <Button
      aria-label="Sair"
      className={inverse ? "text-white/60 hover:bg-white/8 hover:text-white" : undefined}
      onClick={handleSignOut}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Icon name="log-out" size={18} />
    </Button>
  );
}
