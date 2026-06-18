import { describe, expect, it, vi } from "vitest";
import type { AddressLookupProvider, ZipcodeAddress } from "../../application/providers/AddressLookupProvider.js";
import { FallbackAddressLookupProvider } from "./FallbackAddressLookupProvider.js";

const address: ZipcodeAddress = {
  zipcode: "01001000",
  street: "Praça da Sé",
  complement: null,
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
};

function provider(name: string, lookup: AddressLookupProvider["lookup"]): AddressLookupProvider {
  return { name, lookup };
}

describe("FallbackAddressLookupProvider", () => {
  it("returns the first provider that resolves an address", async () => {
    const second = vi.fn();
    const fallback = new FallbackAddressLookupProvider([
      provider("primary", async () => address),
      provider("secondary", second),
    ]);

    await expect(fallback.lookup("01001000")).resolves.toEqual(address);
    expect(second).not.toHaveBeenCalled();
  });

  it("falls back to the next provider when the primary one throws", async () => {
    const logger = { warn: vi.fn() };
    const fallback = new FallbackAddressLookupProvider(
      [
        provider("primary", async () => {
          throw new Error("ViaCEP down");
        }),
        provider("secondary", async () => address),
      ],
      logger,
    );

    await expect(fallback.lookup("01001000")).resolves.toEqual(address);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("continues searching when a provider reports no match", async () => {
    const fallback = new FallbackAddressLookupProvider([
      provider("primary", async () => null),
      provider("secondary", async () => address),
    ]);

    await expect(fallback.lookup("01001000")).resolves.toEqual(address);
  });

  it("returns null when every reachable provider reports no match", async () => {
    const fallback = new FallbackAddressLookupProvider([
      provider("primary", async () => null),
      provider("secondary", async () => null),
    ]);

    await expect(fallback.lookup("99999999")).resolves.toBeNull();
  });

  it("re-throws when all providers fail", async () => {
    const fallback = new FallbackAddressLookupProvider([
      provider("primary", async () => {
        throw new Error("ViaCEP down");
      }),
      provider("secondary", async () => {
        throw new Error("BrasilAPI down");
      }),
    ]);

    await expect(fallback.lookup("01001000")).rejects.toThrow("BrasilAPI down");
  });

  it("requires at least one provider", () => {
    expect(() => new FallbackAddressLookupProvider([])).toThrow();
  });
});
