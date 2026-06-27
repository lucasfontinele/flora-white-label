import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { isValidBrazilianState } from "../../../addresses/domain/brazilian-states.js";

export interface PrescriberProps {
  organizationId: string;
  patientId: string;
  fullName: string;
  crm: string;
  crmState: string;
}

/**
 * Médico prescritor attached to a patient. A patient may have several
 * prescribers; each carries the doctor's full name and CRM scoped by its UF.
 */
export class Prescriber extends Entity<PrescriberProps> {
  private constructor(props: PrescriberProps, id?: string) {
    super(props, id);
  }

  static create(props: PrescriberProps, id?: string): Prescriber {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Prescriber requires an organizationId.");
    }

    const patientId = props.patientId.trim();
    if (patientId.length === 0) {
      throw new DomainValidationError("Prescriber requires a patientId.");
    }

    const { fullName, crm, crmState } = Prescriber.normalizeDetails(props);

    return new Prescriber({ organizationId, patientId, fullName, crm, crmState }, id);
  }

  /** Validates and normalizes the editable fields (name, CRM, UF). */
  private static normalizeDetails(details: {
    fullName: string;
    crm: string;
    crmState: string;
  }): { fullName: string; crm: string; crmState: string } {
    const fullName = details.fullName.trim();
    if (fullName.length === 0) {
      throw new DomainValidationError("Prescriber fullName is required.");
    }

    const crm = details.crm.trim();
    if (crm.length === 0) {
      throw new DomainValidationError("Prescriber crm is required.");
    }

    const crmState = details.crmState.trim().toUpperCase();
    if (!isValidBrazilianState(crmState)) {
      throw new DomainValidationError(`Invalid CRM state (UF): "${details.crmState}".`);
    }

    return { fullName, crm, crmState };
  }

  /** Applies an edit to the prescriber's name/CRM/UF, keeping its identity. */
  update(details: { fullName: string; crm: string; crmState: string }): void {
    const normalized = Prescriber.normalizeDetails(details);
    this.props.fullName = normalized.fullName;
    this.props.crm = normalized.crm;
    this.props.crmState = normalized.crmState;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get crm(): string {
    return this.props.crm;
  }

  get crmState(): string {
    return this.props.crmState;
  }
}
