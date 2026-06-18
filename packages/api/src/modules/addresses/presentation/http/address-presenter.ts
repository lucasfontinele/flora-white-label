import type { ZipcodeAddress } from "../../application/providers/AddressLookupProvider.js";

export interface ZipcodeAddressResponse {
  zipcode: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export class AddressPresenter {
  static zipcodeToHttp(address: ZipcodeAddress): ZipcodeAddressResponse {
    return {
      zipcode: address.zipcode,
      street: address.street,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    };
  }
}
