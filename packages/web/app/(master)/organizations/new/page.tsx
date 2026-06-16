import { OrganizationRegistrationForm } from "../components/organization-registration-form";

export default function NewOrganizationPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl text-[var(--text-primary)]">Cadastrar organização</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Registre uma associação legalizada com dados empresariais, endereço e plano inicial.
        </p>
      </div>
      <OrganizationRegistrationForm />
    </main>
  );
}
