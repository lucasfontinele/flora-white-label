import type { Address } from "../../domain/entities/Address.js";

export interface AddressRepository {
  create(address: Address): Promise<void>;
  save(address: Address): Promise<void>;
  delete(id: string): Promise<void>;
}
