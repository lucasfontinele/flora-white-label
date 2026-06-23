import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DocumentsPatientSelector } from "./documents-patient-selector";

const patients = [
  { id: "p1", name: "Maria Fernanda" },
  { id: "p2", name: "Gabriel Barbosa" },
];

describe("DocumentsPatientSelector", () => {
  it("renders a button per patient and marks the selected one", () => {
    render(
      <DocumentsPatientSelector patients={patients} selectedPatientId="p1" onSelect={() => {}} />,
    );

    expect(screen.getByRole("button", { name: /Maria Fernanda/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Gabriel Barbosa/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onSelect with the patient id when a chip is clicked", () => {
    const onSelect = vi.fn();
    render(
      <DocumentsPatientSelector patients={patients} selectedPatientId="p1" onSelect={onSelect} />,
    );

    screen.getByRole("button", { name: /Gabriel Barbosa/ }).click();
    expect(onSelect).toHaveBeenCalledWith("p2");
  });
});
