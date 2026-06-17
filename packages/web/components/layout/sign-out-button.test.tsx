import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignOutButton } from "./sign-out-button";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
  }),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mocks.refresh.mockReset();
    mocks.push.mockReset();
  });

  it("posts logout and returns the user to the login route", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { signedOut: true } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/entrar");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
});
