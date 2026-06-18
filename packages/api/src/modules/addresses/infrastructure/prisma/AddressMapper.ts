import type { Prisma, Address as PrismaAddress } from "@prisma/client";
import { Address } from "../../domain/entities/Address.js";

export class AddressMapper {
  static toDomain(record: PrismaAddress): Address {
    return Address.create(
      {
        title: record.title,
        zipcode: record.zipcode,
        street: record.street,
        neighborhood: record.neighborhood,
        complement: record.complement,
        city: record.city,
        state: record.state,
      },
      record.id,
    );
  }

  static toPersistence(address: Address): Prisma.AddressUncheckedCreateInput {
    return {
      id: address.id,
      title: address.title,
      zipcode: address.zipcode,
      street: address.street,
      neighborhood: address.neighborhood,
      complement: address.complement,
      city: address.city,
      state: address.state,
    };
  }

  static toUpdatePersistence(address: Address): Prisma.AddressUncheckedUpdateInput {
    return {
      title: address.title,
      zipcode: address.zipcode,
      street: address.street,
      neighborhood: address.neighborhood,
      complement: address.complement,
      city: address.city,
      state: address.state,
    };
  }
}
