import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationRegistrationForm } from "./organization-registration-form";
import { lookupAddressByZipcode } from "../requests/lookup-address";
import type { SubscriptionPlan } from "../types";

vi.mock("../requests/lookup-address", () => ({
  lookupAddressByZipcode: vi.fn(),
}));

const lookupMock = vi.mocked(lookupAddressByZipcode);

// Default: never settles, so the CEP lookup stays pending and never overwrites
// fields the test fills by hand. Individual tests override as needed.
beforeEach(() => {
  lookupMock.mockReset();
  lookupMock.mockImplementation(() => new Promise(() => {}));
});

const plan: SubscriptionPlan = {
  id: "plan_starter",
  title: "Starter",
  description: null,
  priceInCents: 59700,
  operatorsLimit: 10,
  patientsLimit: 50,
  unlimitedOperators: false,
  createdAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z",
};

async function fillCompanyStep() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Razão social"), "Associacao Medicinal Exemplo LTDA");
  await user.type(screen.getByLabelText("Nome fantasia"), "Associacao Exemplo");
  await user.type(screen.getByLabelText("CNPJ"), "11222333000181");
  await user.type(screen.getByLabelText("CNAE principal"), "9430800");

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

    render(<OrganizationRegistrationForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe a razão social.")).toBeInTheDocument();
    expect(screen.getByText("Informe um CNPJ válido.")).toBeInTheDocument();
  });

  it("moves between company and address steps while preserving values", async () => {
    render(<OrganizationRegistrationForm onSubmit={vi.fn()} />);

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
    render(<OrganizationRegistrationForm onSubmit={vi.fn()} />);

    const user = await fillCompanyStep();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(await screen.findByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Informe um CEP válido.")).toBeInTheDocument();
    expect(screen.getByText("Informe o logradouro.")).toBeInTheDocument();
  });

  it("manages secondary CNAEs as tags", async () => {
    render(<OrganizationRegistrationForm onSubmit={vi.fn()} />);

    const user = await fillCompanyStep();

    expect(screen.getByLabelText("CNAE principal")).toHaveValue("9430-8/00");

    await user.type(screen.getByLabelText("CNAEs secundários"), "9430800{enter}");

    expect(screen.getByText("9430-8/00")).toBeInTheDocument();

    await user.type(screen.getByLabelText("CNAEs secundários"), "9430800{enter}");
    expect(await screen.findByText("Este CNAE já foi adicionado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remover CNAE 9430-8/00" }));
    expect(screen.queryByRole("button", { name: "Remover CNAE 9430-8/00" })).not.toBeInTheDocument();
  });

  it("loads plans, reviews data, and submits the mapped write body", async () => {
    const onSubmit = vi.fn();

    render(<OrganizationRegistrationForm availablePlans={[plan]} onSubmit={onSubmit} />);

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
    await user.click(screen.getByRole("button", { name: "Cadastrar organização" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: expect.objectContaining({
          cnpj: "11222333000181",
          primaryCnae: "9430800",
          secondaryCnaes: ["9499500"],
          currentPlanId: "plan_starter",
        }),
        address: expect.objectContaining({
          zipcode: "77001000",
          street: "Quadra 101 Sul, 10",
          state: "TO",
        }),
      }),
    );
  });

  it("autofills the address fields from the CEP lookup", async () => {
    lookupMock.mockResolvedValue({
      zipcode: "77001000",
      street: "Quadra 101 Sul",
      complement: null,
      neighborhood: "Plano Diretor Sul",
      city: "Palmas",
      state: "TO",
    });

    render(<OrganizationRegistrationForm onSubmit={vi.fn()} />);

    const user = await fillCompanyStep();
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await user.type(await screen.findByLabelText("CEP"), "77001000");

    expect(lookupMock).toHaveBeenCalledWith("77001000");
    expect(await screen.findByLabelText("Logradouro")).toHaveValue("Quadra 101 Sul");
    expect(screen.getByLabelText("Bairro")).toHaveValue("Plano Diretor Sul");
    expect(screen.getByLabelText("Cidade")).toHaveValue("Palmas");
    expect(screen.getByLabelText("Estado")).toHaveValue("TO");
  });

  it("shows plan loading and plan error states", async () => {
    const loadingRender = render(<OrganizationRegistrationForm isLoadingPlans onSubmit={vi.fn()} />);

    await goToPlanStep();
    expect(await screen.findByText("Carregando planos...")).toBeInTheDocument();
    loadingRender.unmount();

    render(<OrganizationRegistrationForm onSubmit={vi.fn()} plansError={new Error("Falha")} />);
    await goToPlanStep();
    expect(await screen.findByText("Não foi possível carregar os planos.")).toBeInTheDocument();
  });
});
