import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { AddressLookupProvider, ZipcodeAddress } from "../providers/AddressLookupProvider.js";
import { LookupAddressByZipcodeUseCase } from "./LookupAddressByZipcodeUseCase.js";

const address: ZipcodeAddress = {
  zipcode: "01001000",
  street: "Praça da Sé",
  complement: "lado ímpar",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
};

function makeProvider(lookup: AddressLookupProvider["lookup"]): AddressLookupProvider {
  return { name: "fake", lookup };
}

describe("LookupAddressByZipcodeUseCase", () => {
  it("normalizes the zipcode and returns the provider result", async () => {
    const lookup = vi.fn().mockResolvedValue(address);
    const useCase = new LookupAddressByZipcodeUseCase(makeProvider(lookup));

    await expect(useCase.execute({ zipcode: "01001-000" })).resolves.toEqual(address);
    expect(lookup).toHaveBeenCalledWith("01001000");
  });

  it("rejects a zipcode that does not have 8 digits without calling the provider", async () => {
    const lookup = vi.fn();
    const useCase = new LookupAddressByZipcodeUseCase(makeProvider(lookup));

    await expect(useCase.execute({ zipcode: "123" })).rejects.toBeInstanceOf(DomainValidationError);
    expect(lookup).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the provider has no match", async () => {
    const useCase = new LookupAddressByZipcodeUseCase(makeProvider(async () => null));

    await expect(useCase.execute({ zipcode: "99999999" })).rejects.toBeInstanceOf(NotFoundError);
  });
});
