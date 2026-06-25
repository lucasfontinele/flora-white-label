import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DocumentApprovalAction } from "../enums/DocumentApprovalAction.js";

export interface OrganizationDocumentApprovalLogProps {
  action: DocumentApprovalAction;
  patientApprovalId: string;
  organizationUserId: string;
}

export class OrganizationDocumentApprovalLog extends Entity<OrganizationDocumentApprovalLogProps> {
  private constructor(props: OrganizationDocumentApprovalLogProps, id?: string) {
    super(props, id);
  }

  static create(
    props: OrganizationDocumentApprovalLogProps,
    id?: string,
  ): OrganizationDocumentApprovalLog {
    if (!Object.values(DocumentApprovalAction).includes(props.action)) {
      throw new DomainValidationError("Invalid document approval log action.");
    }

    const patientApprovalId = props.patientApprovalId.trim();
    if (patientApprovalId.length === 0) {
      throw new DomainValidationError("Approval log requires a patientApprovalId.");
    }

    const organizationUserId = props.organizationUserId.trim();
    if (organizationUserId.length === 0) {
      throw new DomainValidationError("Approval log requires an organizationUserId.");
    }

    return new OrganizationDocumentApprovalLog(
      { action: props.action, patientApprovalId, organizationUserId },
      id,
    );
  }

  get action(): DocumentApprovalAction {
    return this.props.action;
  }

  get patientApprovalId(): string {
    return this.props.patientApprovalId;
  }

  get organizationUserId(): string {
    return this.props.organizationUserId;
  }
}
