import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequiredDocumentsTable } from "./required-documents-table";
import type { RequiredDocument } from "../types";

const document: RequiredDocument = {
  id: "doc_1",
  organizationId: "org_1",
  name: "Receita médica",
  observations: "Trazer a via original assinada.",
  createdAt: "2026-06-22T00:00:00.000Z",
  updatedAt: "2026-06-22T00:00:00.000Z",
};

describe("RequiredDocumentsTable", () => {
  it("shows a skeleton while loading", () => {
    const { container } = render(<RequiredDocumentsTable documents={[]} isLoading />);

    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText("Nenhum documento exigido cadastrado")).not.toBeInTheDocument();
  });

  it("shows an empty state", () => {
    render(<RequiredDocumentsTable documents={[]} />);

    expect(screen.getByText("Nenhum documento exigido cadastrado")).toBeInTheDocument();
  });

  it("shows an error state with retry action", () => {
    const onRetry = vi.fn();

    render(<RequiredDocumentsTable documents={[]} error={new Error("Falha")} onRetry={onRetry} />);

    expect(screen.getByText("Não foi possível carregar os documentos")).toBeInTheDocument();
    screen.getByRole("button", { name: "Tentar novamente" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the document name and observations", () => {
    render(<RequiredDocumentsTable documents={[document]} />);

    expect(screen.getByText("Receita médica")).toBeInTheDocument();
    expect(screen.getByText("Trazer a via original assinada.")).toBeInTheDocument();
  });

  it("renders a dash when there are no observations", () => {
    render(<RequiredDocumentsTable documents={[{ ...document, observations: null }]} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onEdit and onDelete from the row actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<RequiredDocumentsTable documents={[document]} onEdit={onEdit} onDelete={onDelete} />);

    screen.getByRole("button", { name: "Editar documento Receita médica" }).click();
    expect(onEdit).toHaveBeenCalledWith(document);

    screen.getByRole("button", { name: "Remover documento Receita médica" }).click();
    expect(onDelete).toHaveBeenCalledWith(document);
  });
});
