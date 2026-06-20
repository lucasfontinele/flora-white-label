import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

vi.mock("./requests/sign-in", () => ({
  signIn: mocks.signIn,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.refresh.mockReset();
    mocks.push.mockReset();
    mocks.signIn.mockReset();
  });

  it("validates required login fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("submits normalized credentials and redirects by returned landing path", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockResolvedValue({
      redirectTo: "/painel",
      user: {
        email: "master@flora.local",
        id: "user_master",
        organizationId: "org_master",
        profile: "Master",
        patientId: null,
      },
      context: {
        view: "BackofficeMaster",
        organizationId: "org_master",
        patientId: null,
        organization: {
          id: "org_master",
          tradeName: "Flora",
          legalName: "Flora Plataforma",
          slug: "flora",
          logoUrl: null,
          primaryColor: null,
          secondaryColor: null,
        },
        guardian: null,
        patient: null,
        employee: null,
        managedPatients: [],
      },
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), " MASTER@FLORA.LOCAL ");
    await user.type(screen.getByLabelText("Senha"), "Acesso@123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledWith({ email: "master@flora.local", password: "Acesso@123" }));
    expect(mocks.push).toHaveBeenCalledWith("/painel");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("shows a generic authentication error without clearing the e-mail field", async () => {
    const user = userEvent.setup();
    mocks.signIn.mockRejectedValue(new Error("Credenciais inválidas."));
    render(<LoginForm />);

    await user.type(screen.getByLabelText("E-mail"), "master@flora.local");
    await user.type(screen.getByLabelText("Senha"), "senha-errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciais inválidas.")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("master@flora.local");
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
