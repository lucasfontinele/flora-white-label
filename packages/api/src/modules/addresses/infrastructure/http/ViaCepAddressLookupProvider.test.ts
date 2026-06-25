import { describe, expect, it, vi } from "vitest";
import { ViaCepAddressLookupProvider } from "./ViaCepAddressLookupProvider.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("ViaCepAddressLookupProvider", () => {
  it("maps a successful ViaCEP response to the normalized address", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        cep: "01001-000",
        logradouro: "Praça da Sé",
        complemento: "lado ímpar",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "sp",
      }),
    );
    const provider = new ViaCepAddressLookupProvider({ fetchFn, baseUrl: "https://viacep.test/ws" });

    await expect(provider.lookup("01001000")).resolves.toEqual({
      zipcode: "01001000",
      street: "Praça da Sé",
      complement: "lado ímpar",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    });
    expect(fetchFn).toHaveBeenCalledWith("https://viacep.test/ws/01001000/json/", expect.any(Object));
  });

  it("returns null when ViaCEP reports an unknown zipcode", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ erro: true }));
    const provider = new ViaCepAddressLookupProvider({ fetchFn });

    await expect(provider.lookup("99999999")).resolves.toBeNull();
  });

  it("throws on a non-ok response so a fallback can take over", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    const provider = new ViaCepAddressLookupProvider({ fetchFn });

    await expect(provider.lookup("01001000")).rejects.toThrow(/status 500/);
  });
});
