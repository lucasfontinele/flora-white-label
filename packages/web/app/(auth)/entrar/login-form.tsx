"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { signIn } from "./requests/sign-in";
import { loginSchema, type LoginSchema } from "./schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginSchema) {
    try {
      const result = await signIn(data);
      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setError("root", {
        message: "Credenciais inválidas.",
      });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

      {errors.root ? <p className="text-sm font-medium text-error">{errors.root.message}</p> : null}

      <div className="flex justify-end">
        <Link
          href="/entrar"
          className="text-sm font-bold text-[var(--green-700)] hover:text-[var(--green-800)]"
        >
          Esqueci minha senha
        </Link>
      </div>

      <div className="grid gap-3">
        <Button fullWidth type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
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
