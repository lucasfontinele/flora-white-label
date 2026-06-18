import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { AddressLookupProvider, ZipcodeAddress } from "../providers/AddressLookupProvider.js";

export interface LookupAddressByZipcodeInput {
  zipcode: string;
}

/**
 * Resolves an address from a zipcode (CEP) through an {@link AddressLookupProvider}.
 * The use case validates the zipcode format and translates a missing result into
 * a transport-agnostic {@link NotFoundError}; it knows nothing about which
 * provider (or providers) actually answered.
 */
export class LookupAddressByZipcodeUseCase {
  constructor(private readonly provider: AddressLookupProvider) {}

  async execute(input: LookupAddressByZipcodeInput): Promise<ZipcodeAddress> {
    const zipcode = (input.zipcode ?? "").replace(/\D/g, "");

    if (zipcode.length !== 8) {
      throw new DomainValidationError("Zipcode must have exactly 8 digits.");
    }

    const address = await this.provider.lookup(zipcode);

    if (!address) {
      throw new NotFoundError(`No address was found for zipcode "${zipcode}".`);
    }

    return address;
  }
}
