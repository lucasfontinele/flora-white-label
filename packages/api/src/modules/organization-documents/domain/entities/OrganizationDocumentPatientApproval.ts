import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DocumentApprovalAction } from "../enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../enums/DocumentApprovalStatus.js";

export interface OrganizationDocumentPatientApprovalProps {
  organizationId: string;
  documentId: string;
  patientId: string;
  status?: DocumentApprovalStatus;
  rejectedReason?: string | null;
}

export class OrganizationDocumentPatientApproval extends AggregateRoot<Required<OrganizationDocumentPatientApprovalProps>> {
  private constructor(props: Required<OrganizationDocumentPatientApprovalProps>, id?: string) {
    super(props, id);
  }

  static create(
    props: OrganizationDocumentPatientApprovalProps,
    id?: string,
  ): OrganizationDocumentPatientApproval {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Patient document approval requires an organizationId.");
    }

    const documentId = props.documentId.trim();
    if (documentId.length === 0) {
      throw new DomainValidationError("Patient document approval requires a documentId.");
    }

    const patientId = props.patientId.trim();
    if (patientId.length === 0) {
      throw new DomainValidationError("Patient document approval requires a patientId.");
    }

    const status = props.status ?? DocumentApprovalStatus.Pending;
    const rejectedReason = normalizeRejectedReason(props.rejectedReason ?? null);
    validateStatusReason(status, rejectedReason);

    return new OrganizationDocumentPatientApproval(
      { organizationId, documentId, patientId, status, rejectedReason },
      id,
    );
  }

  approve(): DocumentApprovalAction {
    this.props.status = DocumentApprovalStatus.Approved;
    this.props.rejectedReason = null;

    return DocumentApprovalAction.ApprovedDocument;
  }

  reject(reason: string): DocumentApprovalAction {
    const rejectedReason = normalizeRejectedReason(reason);

    if (rejectedReason === null) {
      throw new DomainValidationError("rejectedReason is required when rejecting a document.");
    }

    this.props.status = DocumentApprovalStatus.Rejected;
    this.props.rejectedReason = rejectedReason;

    return DocumentApprovalAction.RejectedDocument;
  }

  resetToPending(): DocumentApprovalAction {
    this.props.status = DocumentApprovalStatus.Pending;
    this.props.rejectedReason = null;

    return DocumentApprovalAction.ResetDocumentToPending;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get documentId(): string {
    return this.props.documentId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get status(): DocumentApprovalStatus {
    return this.props.status;
  }

  get rejectedReason(): string | null {
    return this.props.rejectedReason;
  }
}

function normalizeRejectedReason(reason: string | null): string | null {
  if (reason === null) {
    return null;
  }

  const trimmed = reason.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validateStatusReason(status: DocumentApprovalStatus, rejectedReason: string | null): void {
  if (!Object.values(DocumentApprovalStatus).includes(status)) {
    throw new DomainValidationError("Invalid document approval status.");
  }

  if (status === DocumentApprovalStatus.Rejected && rejectedReason === null) {
    throw new DomainValidationError("rejectedReason is required for rejected approvals.");
  }

  if (status !== DocumentApprovalStatus.Rejected && rejectedReason !== null) {
    throw new DomainValidationError("rejectedReason must be null unless approval is rejected.");
  }
}
