"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createOrganization } from "../requests/create-organization";
import { organizationRegistrationSchema, type OrganizationRegistrationSchema } from "../schemas/organization-registration-schema";

const initialForm: OrganizationRegistrationSchema = {
  address: {
    cep: "",
    city: "",
    complement: "",
    logradouro: "",
    neighborhood: "",
    number: "",
    state: "",
  },
  company: {
    cnpj: "",
    foundationDate: "",
    institutionalEmail: "",
    legalName: "",
    primaryCnae: "",
    secondaryCnaes: [],
    tradeName: "",
    whatsapp: "",
  },
  subscriptionPlanId: "",
};

export function OrganizationRegistrationForm() {
  const [form, setForm] = useState<OrganizationRegistrationSchema>(initialForm);
  const [secondaryCnaesText, setSecondaryCnaesText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const parsed = organizationRegistrationSchema.safeParse({
      ...form,
      company: {
        ...form.company,
        secondaryCnaes: secondaryCnaesText
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
    });

    if (!parsed.success) {
      setStatus(parsed.error.issues[0]?.message ?? "Revise os dados da organização.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrganization(parsed.data);
      setStatus(`Organização ${response.data.company.tradeName} cadastrada.`);
      setForm(initialForm);
      setSecondaryCnaesText("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível cadastrar a organização.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            label="Razão social"
            onChange={(value) => setCompany("legalName", value)}
            value={form.company.legalName}
          />
          <Field
            label="Nome fantasia"
            onChange={(value) => setCompany("tradeName", value)}
            value={form.company.tradeName}
          />
          <Field label="CNPJ" onChange={(value) => setCompany("cnpj", value)} value={form.company.cnpj} />
          <Field
            label="Data de fundação"
            onChange={(value) => setCompany("foundationDate", value)}
            type="date"
            value={form.company.foundationDate}
          />
          <Field
            label="CNAE principal"
            onChange={(value) => setCompany("primaryCnae", value)}
            value={form.company.primaryCnae}
          />
          <Field
            label="CNAEs secundários"
            onChange={setSecondaryCnaesText}
            placeholder="Separe por vírgula"
            value={secondaryCnaesText}
          />
          <Field
            label="E-mail institucional"
            onChange={(value) => setCompany("institutionalEmail", value)}
            type="email"
            value={form.company.institutionalEmail}
          />
          <Field
            label="WhatsApp"
            onChange={(value) => setCompany("whatsapp", value)}
            value={form.company.whatsapp}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="CEP" onChange={(value) => setAddress("cep", value)} value={form.address.cep} />
          <Field
            className="md:col-span-2"
            label="Logradouro"
            onChange={(value) => setAddress("logradouro", value)}
            value={form.address.logradouro}
          />
          <Field label="Número" onChange={(value) => setAddress("number", value)} value={form.address.number} />
          <Field
            label="Complemento"
            onChange={(value) => setAddress("complement", value)}
            value={form.address.complement ?? ""}
          />
          <Field
            label="Bairro"
            onChange={(value) => setAddress("neighborhood", value)}
            value={form.address.neighborhood}
          />
          <Field label="Cidade" onChange={(value) => setAddress("city", value)} value={form.address.city} />
          <Field label="Estado" onChange={(value) => setAddress("state", value.toUpperCase())} value={form.address.state} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <Field
            label="ID do plano"
            onChange={(value) => setForm((current) => ({ ...current, subscriptionPlanId: value }))}
            placeholder="plan_starter"
            value={form.subscriptionPlanId}
          />
        </CardContent>
      </Card>

      {status ? <p className="text-sm text-[var(--text-secondary)]">{status}</p> : null}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Cadastrando..." : "Cadastrar organização"}
      </Button>
    </form>
  );

  function setCompany<Key extends keyof OrganizationRegistrationSchema["company"]>(
    key: Key,
    value: OrganizationRegistrationSchema["company"][Key],
  ) {
    setForm((current) => ({
      ...current,
      company: {
        ...current.company,
        [key]: value,
      },
    }));
  }

  function setAddress<Key extends keyof OrganizationRegistrationSchema["address"]>(
    key: Key,
    value: OrganizationRegistrationSchema["address"][Key],
  ) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [key]: value,
      },
    }));
  }
}

function Field({
  className,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">{label}</span>
      <Input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
    </label>
  );
}
