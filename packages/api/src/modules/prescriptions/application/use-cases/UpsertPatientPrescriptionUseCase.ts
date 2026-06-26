import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";
import { computePrescriptionValidUntil } from "../../domain/prescription-validity.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

export interface UpsertPatientPrescriptionItemInput {
  productId: string;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes?: string | null;
}

export interface UpsertPatientPrescriptionInput {
  organizationId: string;
  patientId: string;
  /** Emission date of the receita; validUntil is derived from it (+6 months). */
  issuedAt: Date;
  observations?: string | null;
  items: UpsertPatientPrescriptionItemInput[];
}

export interface UpsertPatientPrescriptionDependencies {
  organizationRepository: OrganizationRepository;
  patientRepository: PatientRepository;
  productRepository: ProductRepository;
  prescriptionRepository: PatientPrescriptionRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Transcribes a patient's receita: stores the emission date (validUntil is
 * derived as +6 months), the optional observation, and the full posology — the
 * per-product purchase allowances. The model keeps a single active prescription
 * per patient, so this creates it on first use and replaces it (and its items)
 * on subsequent edits.
 */
export class UpsertPatientPrescriptionUseCase {
  constructor(private readonly deps: UpsertPatientPrescriptionDependencies) {}

  async execute(input: UpsertPatientPrescriptionInput): Promise<PatientPrescriptionReadModel> {
    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    this.ensureNoDuplicateProducts(input.items);
    await this.ensureProductsAreSellable(input.organizationId, input.items);

    const existing = await this.deps.prescriptionRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );

    const prescription = PatientPrescription.create(
      {
        organizationId: input.organizationId,
        patientId: input.patientId,
        issuedAt: input.issuedAt,
        validUntil: computePrescriptionValidUntil(input.issuedAt),
        observations: input.observations,
      },
      existing?.id,
    );

    const items = input.items.map((item) =>
      PrescriptionItem.create({
        prescriptionId: prescription.id,
        productId: item.productId,
        allowedQuantity: item.allowedQuantity,
        period: item.period,
        notes: item.notes,
      }),
    );

    await this.deps.unitOfWork.execute(async () => {
      if (existing) {
        await this.deps.prescriptionRepository.save(prescription);
      } else {
        await this.deps.prescriptionRepository.create(prescription);
      }
      await this.deps.prescriptionRepository.replaceItems(prescription.id, items);
    });

    const saved = await this.deps.prescriptionRepository.findDetailsByPatient(
      input.organizationId,
      input.patientId,
    );
    if (!saved) {
      throw new NotFoundError("Prescription not found after save.");
    }

    return saved;
  }

  private ensureNoDuplicateProducts(items: UpsertPatientPrescriptionItemInput[]): void {
    const seen = new Set<string>();
    for (const item of items) {
      const productId = item.productId.trim();
      if (seen.has(productId)) {
        throw new DomainValidationError(
          "The posology cannot list the same product more than once.",
        );
      }
      seen.add(productId);
    }
  }

  private async ensureProductsAreSellable(
    organizationId: string,
    items: UpsertPatientPrescriptionItemInput[],
  ): Promise<void> {
    for (const item of items) {
      const product = await this.deps.productRepository.findByIdInOrganization(
        organizationId,
        item.productId,
      );
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found.`);
      }
      if (!product.isActive) {
        throw new ConflictError(`Product ${item.productId} is not active.`);
      }
    }
  }
}
