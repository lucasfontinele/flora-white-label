import { ValueObject } from "./ValueObject.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";
import { isValidCpf, stripDocumentMask } from "./cpf.js";

interface DocumentProps {
  value: string;
}

/**
 * Brazilian CPF document. Stored as digits only (mask removed) and validated
 * against the official check-digit algorithm. Equality is by value.
 */
export class Document extends ValueObject<DocumentProps> {
  private constructor(props: DocumentProps) {
    super(props);
  }

  static create(value: string): Document {
    const digits = stripDocumentMask(value ?? "");

    if (digits.length === 0) {
      throw new DomainValidationError("Document is required.");
    }

    if (!isValidCpf(digits)) {
      throw new DomainValidationError(`Invalid CPF document: "${value}".`);
    }

    return new Document({ value: digits });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
