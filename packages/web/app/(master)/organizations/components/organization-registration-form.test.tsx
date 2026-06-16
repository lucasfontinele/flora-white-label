import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OrganizationRegistrationForm } from "./organization-registration-form";

const plan = {
  code: "starter" as const,
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter" as const,
  operatorLimitType: "limited" as const,
  priceInCents: 59700,
};

async function fillCompanyStep() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Razão social"), "Associacao Medicinal Exemplo LTDA");
  await user.type(screen.getByLabelText("Nome fantasia"), "Associacao Exemplo");
  await user.type(screen.getByLabelText("CNPJ"), "11222333000181");
  await user.type(screen.getByLabelText("Data de fundação"), "2020-01-15");
  await user.type(screen.getByLabelText("CNAE principal"), "9430800");
  await user.type(screen.getByLabelText("E-mail institucional"), "contato@associacao.org.br");
  await user.type(screen.getByLabelText("Telefone"), "6333330000");
  await user.type(screen.getByLabelText("WhatsApp"), "63999990000");

  return user;
}

async function fillAddressStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("CEP"), "77001000");
  await user.type(screen.getByLabelText("Logradouro"), "Quadra 101 Sul");
  await user.type(screen.getByLabelText("Número"), "10");
  await user.type(screen.getByLabelText("Bairro"), "Plano Diretor Sul");
  await user.type(screen.getByLabelText("Cidade"), "Palmas");
  await user.type(screen.getByLabelText("Estado"), "TO");
}

async function goToPlanStep() {
  const user = await fillCompanyStep();
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await fillAddressStep(user);
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  return user;
}

describe("OrganizationRegistrationForm", () => {
  it("blocks progression when company fields are missing", async () => {
    const user = userEvent.setup();

    render(<OrganizationRegistrationForm />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe a razão social.")).toBeInTheDocument();
    expect(screen.getByText("Informe um CNPJ válido.")).toBeInTheDocument();
  });

  it("moves between company and address steps while preserving values", async () => {
    render(<OrganizationRegistrationForm />);

    const user = await fillCompanyStep();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByRole("heading", { name: "Endereço" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("CEP"), "77001-000");
    await user.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.getByLabelText("Razão social")).toHaveValue("Associacao Medicinal Exemplo LTDA");

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByLabelText("CEP")).toHaveValue("77001-000");
  });

  it("blocks address progression when required address fields are missing", async () => {
    render(<OrganizationRegistrationForm />);

    const user = await fillCompanyStep();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(await screen.findByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe um CEP válido.")).toBeInTheDocument();
    expect(screen.getByText("Informe o logradouro.")).toBeInTheDocument();
  });

  it("masks institutional fields and manages secondary CNAEs as tags", async () => {
    render(<OrganizationRegistrationForm />);

    const user = await fillCompanyStep();

    expect(screen.getByLabelText("CNPJ")).toHaveValue("11.222.333/0001-81");
    expect(screen.getByLabelText("CNAE principal")).toHaveValue("9430-8/00");
    expect(screen.getByLabelText("Telefone")).toHaveValue("(63) 3333-0000");
    expect(screen.getByLabelText("WhatsApp")).toHaveValue("(63) 99999-0000");

    await user.type(screen.getByLabelText("CNAEs secundários"), "9430800{enter}");

    expect(screen.getByText("9430-8/00")).toBeInTheDocument();

    await user.type(screen.getByLabelText("CNAEs secundários"), "9430800{enter}");
    expect(await screen.findByText("Este CNAE já foi adicionado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover CNAE 9430-8/00" }));
    expect(screen.queryByRole("button", { name: "Remover CNAE 9430-8/00" })).not.toBeInTheDocument();
  });

  it("loads plans, reviews data, submits successfully, and supports retry state", async () => {
    const createOrganization = vi.fn().mockResolvedValue({
      data: {
        company: {
          tradeName: "Associacao Exemplo",
        },
      },
    });

    render(<OrganizationRegistrationForm availablePlans={[plan]} onCreate={createOrganization as never} />);

    const user = await fillCompanyStep();
    await user.type(screen.getByLabelText("CNAEs secundários"), "9499500{enter}");
    expect(screen.getByText("9499-5/00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await fillAddressStep(user);
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("R$ 597,00")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Starter/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("Associacao Exemplo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cadastrar organização" }));

    expect(createOrganization).toHaveBeenCalledTimes(1);
    expect(createOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({
          cep: "77001000",
          state: "TO",
        }),
        company: expect.objectContaining({
          cnpj: "11222333000181",
          phone: "6333330000",
          primaryCnae: "9430800",
          secondaryCnaes: ["9499500"],
          whatsapp: "63999990000",
        }),
      }),
    );
    expect(await screen.findByText("Organização Associacao Exemplo cadastrada.")).toBeInTheDocument();
  });

  it("shows plan loading and plan error states", async () => {
    const loadingRender = render(<OrganizationRegistrationForm isLoadingPlans />);

    await goToPlanStep();
    expect(await screen.findByText("Carregando planos...")).toBeInTheDocument();
    loadingRender.unmount();

    render(<OrganizationRegistrationForm plansError={new Error("Falha")} />);
    await goToPlanStep();
    expect(await screen.findByText("Não foi possível carregar os planos.")).toBeInTheDocument();
  });
});
