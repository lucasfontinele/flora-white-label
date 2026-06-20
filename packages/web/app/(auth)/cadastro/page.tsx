import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getTenant } from "@/lib/tenant";
import { RegistrationForm } from "./components/registration-form";

export default async function RegistrationPage() {
  const tenant = await getTenant();
  return (
    <main className="min-h-screen bg-[var(--neutral-100)] px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1680px] gap-6 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)] xl:items-start">
        <aside className="rounded-xl bg-petrol-700 p-6 text-white shadow-xl md:p-8 xl:sticky xl:top-6 xl:min-h-[calc(100vh-3rem)]">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-mark.svg" alt="Flora" width={52} height={52} className="h-12 w-12" />
            <div>
              <p className="text-xl font-extrabold">Flora</p>
              <p className="text-sm text-white/65">Vida Verde</p>
            </div>
          </div>

          <div className="mt-12 max-w-sm">
            <p className="mb-3 text-sm font-bold uppercase text-[var(--accent-500)]">Cadastro</p>
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              Comece com as informações essenciais.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/72">
              Organizamos o cadastro em etapas curtas para reduzir erro de preenchimento e preparar a
              análise documental.
            </p>
          </div>

          <div className="mt-10 rounded-lg border border-white/10 bg-white/8 p-4">
            <div className="flex items-start gap-3">
              <Icon name="shield-check" size={20} className="mt-0.5 text-[var(--accent-500)]" />
              <div>
                <p className="font-bold">Processo seguro</p>
                <p className="mt-1 text-sm text-white/68">
                  Seus dados são usados para análise de cadastro e validação dos documentos exigidos
                  pela associação.
                </p>
              </div>
            </div>
          </div>

          <Button asChild className="mt-8 border-white/12 bg-white/10 text-white hover:bg-white/14" variant="secondary">
            <Link href="/entrar">
              <Icon name="arrow-left" size={18} />
              Já tenho cadastro
            </Link>
          </Button>
        </aside>

        <section className="min-w-0">
          <RegistrationForm organizationId={tenant?.organizationId} />
        </section>
      </div>
    </main>
  );
}
