import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrganizationListTable } from "./organization-list-table";

const plan = {
  code: "starter" as const,
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter" as const,
  operatorLimitType: "limited" as const,
  priceInCents: 59700,
};

const organization = {
  city: "Palmas",
  cnpj: "11222333000181",
  createdAt: "2026-06-16T00:00:00.000Z",
  id: "org_1",
  legalName: "Associacao Medicinal Exemplo LTDA",
  state: "TO",
  subscriptionPlan: plan,
  tradeName: "Associacao Exemplo",
};

const pagination = {
  page: 1,
  perPage: 20,
  total: 1,
  totalPages: 1,
};

describe("OrganizationListTable", () => {
  it("shows a loading state", () => {
    render(<OrganizationListTable isLoading organizations={[]} pagination={pagination} />);

    expect(screen.getByText("Carregando organizações...")).toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<OrganizationListTable organizations={[]} pagination={{ ...pagination, total: 0, totalPages: 0 }} />);

    expect(screen.getByText("Nenhuma organização cadastrada")).toBeInTheDocument();
  });

  it("shows an error state with retry action", () => {
    const onRetry = vi.fn();

    render(<OrganizationListTable error={new Error("Falha")} onRetry={onRetry} organizations={[]} pagination={pagination} />);

    expect(screen.getByText("Não foi possível carregar as organizações")).toBeInTheDocument();
    screen.getByRole("button", { name: "Tentar novamente" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows organization rows with selected plan information", () => {
    render(<OrganizationListTable organizations={[organization]} pagination={pagination} />);

    expect(screen.getByText("Associacao Exemplo")).toBeInTheDocument();
    expect(screen.getByText("11.222.333/0001-81")).toBeInTheDocument();
    expect(screen.getByText("Palmas/TO")).toBeInTheDocument();
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("10 operadores")).toBeInTheDocument();
    expect(screen.getByText("50 usuários")).toBeInTheDocument();
  });
});
