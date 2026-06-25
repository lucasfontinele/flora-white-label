"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import { formatCpf, onlyDigits } from "@/lib/masks";
import { acceptInvitation } from "./requests/accept-invitation";
import { getInvitation } from "./requests/get-invitation";
import type { InvitationStatus } from "./types";

const unavailableMessage: Record<InvitationStatus, string> = {
  PENDING: "Este convite expirou. Peça um novo convite à sua associação.",
  ACCEPTED: "Este convite já foi utilizado. Acesse sua conta para continuar.",
  EXPIRED: "Este convite expirou. Peça um novo convite à sua associação.",
  REVOKED: "Este convite foi cancelado. Fale com a sua associação.",
};

type FormErrors = Partial<Record<"fullName" | "document" | "password" | "confirmPassword", string>>;

export function InviteRegistration({ token }: { token: string }) {
  const { toast } = useToast();
  const query = useQuery({
    queryKey: ["employee-invitation", token],
    queryFn: () => getInvitation(token),
    retry: false,
  });

  const [fullName, setFullName] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (fullName.trim().length === 0) next.fullName = "Informe seu nome completo.";
    if (onlyDigits(document).length !== 11) next.document = "Informe um CPF válido (11 dígitos).";
    if (password.length < 8) next.password = "A senha deve ter ao menos 8 caracteres.";
    if (confirmPassword !== password) next.confirmPassword = "As senhas não coincidem.";
    return next;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      await acceptInvitation(token, {
        fullName: fullName.trim(),
        document: onlyDigits(document),
        password,
      });
      setCompleted(true);
    } catch (error) {
      toast({ variant: "error", title: "Não foi possível concluir", description: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--neutral-100)] px-4 py-10">
      <div className="mx-auto flex max-w-lg flex-col">
        <div className="mb-6 flex items-center gap-3">
          <Image src="/brand/logo-mark.svg" alt="Flora" width={44} height={44} className="h-11 w-11" />
          <div>
            <p className="text-lg font-extrabold text-[var(--text-primary)]">Flora</p>
            <p className="text-sm text-[var(--text-tertiary)]">Conclua seu cadastro</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xl md:p-8">
          {query.isLoading ? (
            <p className="text-[var(--text-secondary)]">Carregando convite...</p>
          ) : query.isError || !query.data ? (
            <InviteMessage
              icon="alert-triangle"
              title="Convite inválido"
              description="Não encontramos este convite. Verifique o link recebido por e-mail."
            />
          ) : completed ? (
            <InviteMessage
              icon="check"
              title="Cadastro concluído!"
              description="Sua conta foi criada. Agora você já pode acessar a plataforma."
            />
          ) : !query.data.isAcceptable ? (
            <InviteMessage
              icon="alert-triangle"
              title="Convite indisponível"
              description={unavailableMessage[query.data.status]}
            />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Bem-vindo à {query.data.organizationName}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Você foi convidado como <strong>{query.data.roleName}</strong>. Preencha seus dados
                  para ativar o acesso de <strong>{query.data.email}</strong>.
                </p>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <Field label="Nome completo" htmlFor="fullName" error={errors.fullName}>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    leadingIcon={<Icon name="user" size={18} />}
                    autoComplete="name"
                  />
                </Field>

                <Field label="CPF" htmlFor="document" error={errors.document}>
                  <Input
                    id="document"
                    value={document}
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    onChange={(event) => setDocument(formatCpf(event.target.value))}
                    leadingIcon={<Icon name="file-text" size={18} />}
                  />
                </Field>

                <Field label="Senha" htmlFor="password" error={errors.password}>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    leadingIcon={<Icon name="lock" size={18} />}
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="Confirmar senha" htmlFor="confirmPassword" error={errors.confirmPassword}>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    leadingIcon={<Icon name="lock" size={18} />}
                    autoComplete="new-password"
                  />
                </Field>

                <Button fullWidth type="submit" disabled={submitting}>
                  {submitting ? "Concluindo..." : "Concluir cadastro"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link className="text-sm font-bold text-[var(--green-700)]" href="/entrar">
              Ir para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}

function InviteMessage({
  icon,
  title,
  description,
}: {
  icon: "check" | "alert-triangle";
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span
        className={
          icon === "check"
            ? "inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-[var(--success-600)]"
            : "inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning-subtle text-[var(--warning-600)]"
        }
      >
        <Icon name={icon} size={24} />
      </span>
      <h1 className="text-xl font-extrabold text-[var(--text-primary)]">{title}</h1>
      <p className="max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
