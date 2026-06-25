import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Icon } from "@/components/ui/icon";
import { landingPathForSession } from "@/lib/auth-redirects";
import { getFloraSession, sessionHasAuth } from "@/lib/session";

export default async function LoginPage() {
  const session = await getFloraSession();

  if (sessionHasAuth(session)) {
    redirect(landingPathForSession(session));
  }

  return (
    <main className="min-h-screen bg-[var(--neutral-100)] px-4 py-8 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase text-[var(--green-700)]">Entrada</p>
          <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--text-primary)] md:text-[2.6rem]">
            Acesso à plataforma
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            Preencha as informações abaixo para acessar sua conta e aproveitar todos os recursos que a plataforma oferece para facilitar a gestão da sua associação e impulsionar o crescimento do seu negócio.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-xl md:grid md:grid-cols-[1.08fr_1fr]">
          <div className="flex min-h-[360px] flex-col justify-between bg-petrol-700 p-8 text-white md:p-10">
            <div className="flex items-center gap-3">
              <Image src="/brand/logo-mark.svg" alt="Flora" width={52} height={52} className="h-12 w-12" />
              <div>
                <p className="text-xl font-extrabold">Flora</p>
                <p className="text-sm text-white/65">Vida Verde</p>
              </div>
            </div>

            <div className="max-w-sm">
              <h2 className="text-3xl font-extrabold leading-tight">
                A infraestrutura operacional da sua associação.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/72">
                Pedidos, documentos, catálogo educativo e rastreabilidade em um só lugar, com
                segurança.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-white/76">
              <Icon name="shield-check" size={18} className="text-[var(--accent-500)]" />
              Ambiente seguro e em conformidade
            </div>
          </div>

          <div className="flex items-center p-6 md:p-12">
            <div className="w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Entrar</h2>
                <p className="mt-2 text-[var(--text-secondary)]">Acesse com seu e-mail cadastrado.</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
