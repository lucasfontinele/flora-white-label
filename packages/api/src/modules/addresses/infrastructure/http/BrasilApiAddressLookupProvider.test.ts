import { describe, expect, it, vi } from "vitest";
import { BrasilApiAddressLookupProvider } from "./BrasilApiAddressLookupProvider.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("BrasilApiAddressLookupProvider", () => {
  it("maps a successful BrasilAPI response to the normalized address", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        cep: "01001000",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Sé",
        street: "Praça da Sé",
      }),
    );
    const provider = new BrasilApiAddressLookupProvider({ fetchFn, baseUrl: "https://brasilapi.test/cep/v1" });

    await expect(provider.lookup("01001000")).resolves.toEqual({
      zipcode: "01001000",
      street: "Praça da Sé",
      complement: null,
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    });
    expect(fetchFn).toHaveBeenCalledWith("https://brasilapi.test/cep/v1/01001000", expect.any(Object));
  });

  it("returns null on a 404 (unknown zipcode)", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ message: "CEP não encontrado" }, 404));
    const provider = new BrasilApiAddressLookupProvider({ fetchFn });

    await expect(provider.lookup("99999999")).resolves.toBeNull();
  });

  it("throws on other non-ok responses", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    const provider = new BrasilApiAddressLookupProvider({ fetchFn });

    await expect(provider.lookup("01001000")).rejects.toThrow(/status 500/);
  });
});
