"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Informe sua senha."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "voce@email.com",
      password: "123456",
    },
  });

  return (
    <form className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="email">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          leadingIcon={<Icon name="mail" size={18} />}
          {...register("email")}
        />
        {errors.email ? <p className="text-sm text-error">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="password">
          Senha
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          leadingIcon={<Icon name="lock" size={18} />}
          {...register("password")}
        />
        {errors.password ? <p className="text-sm text-error">{errors.password.message}</p> : null}
      </div>

      <div className="flex justify-end">
        <Link
          href="/entrar"
          className="text-sm font-bold text-[var(--green-700)] hover:text-[var(--green-800)]"
        >
          Esqueci minha senha
        </Link>
      </div>

      <div className="grid gap-3">
        <Button asChild fullWidth>
          <Link href="/dashboard">Entrar como associado</Link>
        </Button>
        <Button asChild fullWidth variant="secondary">
          <Link href="/operacional/dashboard">Entrar na operação</Link>
        </Button>
      </div>

      <div className="rounded-md border border-border bg-muted p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Ainda não tem cadastro?</p>
        <Link className="mt-1 inline-flex text-sm font-bold text-[var(--green-700)]" href="/cadastro">
          Criar cadastro
        </Link>
      </div>
    </form>
  );
}
