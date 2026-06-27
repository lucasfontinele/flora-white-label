import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import { PrescriptionItemScope } from "../../domain/enums/PrescriptionItemScope.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";
import { computePrescriptionValidUntil } from "../../domain/prescription-validity.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

export interface UpsertPatientPrescriptionItemInput {
  scope: PrescriptionItemScope;
  productId?: string | null;
  category?: ProductCategory | null;
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

    this.ensureNoDuplicates(input.items);
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
        scope: item.scope,
        productId: item.productId,
        category: item.category,
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

  private ensureNoDuplicates(items: UpsertPatientPrescriptionItemInput[]): void {
    const seenProducts = new Set<string>();
    const seenCategories = new Set<string>();

    for (const item of items) {
      if (item.scope === PrescriptionItemScope.Product) {
        const productId = item.productId?.trim() ?? "";
        if (seenProducts.has(productId)) {
          throw new DomainValidationError(
            "The posology cannot list the same product more than once.",
          );
        }
        seenProducts.add(productId);
      } else if (item.category) {
        if (seenCategories.has(item.category)) {
          throw new DomainValidationError(
            "The posology cannot list the same category more than once.",
          );
        }
        seenCategories.add(item.category);
      }
    }
  }

  private async ensureProductsAreSellable(
    organizationId: string,
    items: UpsertPatientPrescriptionItemInput[],
  ): Promise<void> {
    for (const item of items) {
      if (item.scope !== PrescriptionItemScope.Product || !item.productId) {
        continue;
      }

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
