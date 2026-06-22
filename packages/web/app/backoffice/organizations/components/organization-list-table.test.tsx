import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrganizationListTable } from "./organization-list-table";
import type { Organization } from "../types";

const organization: Organization = {
  id: "org_1",
  tradeName: "Associacao Exemplo",
  legalName: "Associacao Medicinal Exemplo LTDA",
  cnpj: "11222333000181",
  primaryCnae: "9430800",
  secondaryCnaes: ["9499500"],
  currentPlan: {
    id: "plan_starter",
    title: "Starter",
    priceInCents: 59700,
    operatorsLimit: 10,
    patientsLimit: 50,
  },
  address: {
    id: "addr_1",
    title: null,
    zipcode: "77001000",
    street: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    complement: null,
    city: "Palmas",
    state: "TO",
  },
  createdAt: "2026-06-16T00:00:00.000Z",
  updatedAt: "2026-06-16T00:00:00.000Z",
};

describe("OrganizationListTable", () => {
  it("shows a skeleton while loading", () => {
    const { container } = render(<OrganizationListTable isLoading organizations={[]} />);

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText("Nenhuma organização cadastrada")).not.toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<OrganizationListTable organizations={[]} />);

    expect(screen.getByText("Nenhuma organização cadastrada")).toBeInTheDocument();
  });

  it("shows an error state with retry action", () => {
    const onRetry = vi.fn();

    render(<OrganizationListTable error={new Error("Falha")} onRetry={onRetry} organizations={[]} />);

    expect(screen.getByText("Não foi possível carregar as organizações")).toBeInTheDocument();
    screen.getByRole("button", { name: "Tentar novamente" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders organization rows with plan and address information", () => {
    render(<OrganizationListTable organizations={[organization]} />);

    expect(screen.getByText("Associacao Exemplo")).toBeInTheDocument();
    expect(screen.getByText("11.222.333/0001-81")).toBeInTheDocument();
    expect(screen.getByText("Palmas/TO")).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("10 operadores")).toBeInTheDocument();
    expect(screen.getByText("50 usuários")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute("href", "/organizations/org_1/edit");
  });

  it("calls onDelete when the delete action is triggered", () => {
    const onDelete = vi.fn();

    render(<OrganizationListTable onDelete={onDelete} organizations={[organization]} />);

    screen.getByRole("button", { name: "Excluir organização Associacao Exemplo" }).click();
    expect(onDelete).toHaveBeenCalledWith(organization);
  });
});
