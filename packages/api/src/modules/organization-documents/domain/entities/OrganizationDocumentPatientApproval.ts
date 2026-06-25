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
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  storageKey?: string | null;
}

interface OrganizationDocumentPatientApprovalInternalProps {
  organizationId: string;
  documentId: string;
  patientId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
}

export interface UploadedDocumentMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  storageKey: string;
}

export class OrganizationDocumentPatientApproval extends AggregateRoot<OrganizationDocumentPatientApprovalInternalProps> {
  private constructor(props: OrganizationDocumentPatientApprovalInternalProps, id?: string) {
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
    const fileMetadata = normalizeFileMetadata({
      fileName: props.fileName ?? null,
      mimeType: props.mimeType ?? null,
      size: props.size ?? null,
      storageKey: props.storageKey ?? null,
    });

    return new OrganizationDocumentPatientApproval(
      {
        organizationId,
        documentId,
        patientId,
        status,
        rejectedReason,
        fileName: fileMetadata.fileName,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size,
        storageKey: fileMetadata.storageKey,
      },
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

  attachUploadedFile(input: UploadedDocumentMetadata): DocumentApprovalAction {
    const metadata = validateUploadedDocumentMetadata(input);

    this.props.fileName = metadata.fileName;
    this.props.mimeType = metadata.mimeType;
    this.props.size = metadata.size;
    this.props.storageKey = metadata.storageKey;
    this.props.status = DocumentApprovalStatus.Pending;
    this.props.rejectedReason = null;

    return DocumentApprovalAction.UploadedDocument;
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

  get fileName(): string | null {
    return this.props.fileName;
  }

  get mimeType(): string | null {
    return this.props.mimeType;
  }

  get size(): number | null {
    return this.props.size;
  }

  get storageKey(): string | null {
    return this.props.storageKey;
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

function normalizeFileMetadata(input: {
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
}): UploadedDocumentMetadata | { fileName: null; mimeType: null; size: null; storageKey: null } {
  const hasAnyMetadata =
    input.fileName !== null ||
    input.mimeType !== null ||
    input.size !== null ||
    input.storageKey !== null;

  if (!hasAnyMetadata) {
    return {
      fileName: null,
      mimeType: null,
      size: null,
      storageKey: null,
    };
  }

  if (
    input.fileName === null ||
    input.mimeType === null ||
    input.size === null ||
    input.storageKey === null
  ) {
    throw new DomainValidationError("Uploaded document metadata must be complete.");
  }

  return validateUploadedDocumentMetadata({
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
    storageKey: input.storageKey,
  });
}

function validateUploadedDocumentMetadata(input: UploadedDocumentMetadata): UploadedDocumentMetadata {
  const fileName = input.fileName.trim();
  if (fileName.length === 0) {
    throw new DomainValidationError("Uploaded document fileName is required.");
  }

  const mimeType = input.mimeType.trim();
  if (mimeType.length === 0) {
    throw new DomainValidationError("Uploaded document mimeType is required.");
  }

  if (!Number.isInteger(input.size) || input.size <= 0) {
    throw new DomainValidationError("Uploaded document size must be greater than zero.");
  }

  const storageKey = input.storageKey.trim();
  if (storageKey.length === 0) {
    throw new DomainValidationError("Uploaded document storageKey is required.");
  }

  return {
    fileName,
    mimeType,
    size: input.size,
    storageKey,
  };
}
