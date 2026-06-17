import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { isValidBrazilianState } from "../brazilian-states.js";

export interface AddressProps {
  title: string | null;
  zipcode: string;
  street: string;
  neighborhood: string;
  complement: string | null;
  city: string;
  state: string;
}

export interface CreateAddressInput {
  title?: string | null;
  zipcode: string;
  street: string;
  neighborhood: string;
  complement?: string | null;
  city: string;
  state: string;
}

/**
 * Address with its own identity and table — modeled as a persistable entity
 * (not a value object) because it is referenced by id from other models.
 * `zipcode` is normalized to digits only.
 */
export class Address extends Entity<AddressProps> {
  private constructor(props: AddressProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateAddressInput, id?: string): Address {
    const zipcode = (input.zipcode ?? "").replace(/\D/g, "");
    if (zipcode.length === 0) {
      throw new DomainValidationError("Address zipcode is required.");
    }

    const street = input.street.trim();
    if (street.length === 0) {
      throw new DomainValidationError("Address street is required.");
    }

    const neighborhood = input.neighborhood.trim();
    if (neighborhood.length === 0) {
      throw new DomainValidationError("Address neighborhood is required.");
    }

    const city = input.city.trim();
    if (city.length === 0) {
      throw new DomainValidationError("Address city is required.");
    }

    const state = input.state.trim().toUpperCase();
    if (!isValidBrazilianState(state)) {
      throw new DomainValidationError(`Invalid Brazilian state (UF): "${input.state}".`);
    }

    const title = input.title?.trim();
    const complement = input.complement?.trim();

    return new Address(
      {
        title: title && title.length > 0 ? title : null,
        zipcode,
        street,
        neighborhood,
        complement: complement && complement.length > 0 ? complement : null,
        city,
        state,
      },
      id,
    );
  }

  get title(): string | null {
    return this.props.title;
  }

  get zipcode(): string {
    return this.props.zipcode;
  }

  get street(): string {
    return this.props.street;
  }

  get neighborhood(): string {
    return this.props.neighborhood;
  }

  get complement(): string | null {
    return this.props.complement;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }
}
