import type { Address } from "../../domain/entities/Address.js";

export interface AddressRepository {
  create(address: Address): Promise<void>;
}
