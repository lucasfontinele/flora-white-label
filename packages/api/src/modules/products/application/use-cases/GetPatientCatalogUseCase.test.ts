import { describe, expect, it } from "vitest";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import type { Patient } from "../../../patients/domain/entities/Patient.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { Product } from "../../domain/entities/Product.js";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type {
  PatientCatalogAccess,
  PatientCatalogAccessRepository,
} from "../repositories/PatientCatalogAccessRepository.js";
import { GetPatientCatalogUseCase } from "./GetPatientCatalogUseCase.js";
import { InMemoryProductRepository } from "./product-use-case-test-utils.js";

class FakePatientRepository implements PatientRepository {
  constructor(private readonly status: PatientStatus | null) {}
  async findByIdInOrganization(): Promise<Patient | null> {
    return this.status ? ({ patientStatus: this.status } as unknown as Patient) : null;
  }
  async findDetailsByIdInOrganization(): Promise<PatientReadModel | null> {
    throw new Error("not implemented");
  }
  async findManyByOrganization(): Promise<PatientReadModel[]> {
    throw new Error("not implemented");
  }
  async findByDocument(): Promise<Patient | null> {
    throw new Error("not implemented");
  }
  async create(): Promise<void> {}
  async save(): Promise<void> {}
}

class FakeCatalogAccessRepository implements PatientCatalogAccessRepository {
  constructor(private readonly access: PatientCatalogAccess | null) {}
  async findAccessByPatient(): Promise<PatientCatalogAccess | null> {
    return this.access;
  }
}

function seedProduct(
  repo: InMemoryProductRepository,
  input: { id: string; category: ProductCategory; isActive?: boolean },
) {
  const product = Product.create(
    {
      organizationId: "org-1",
      name: `Product ${input.id}`,
      description: null,
      category: input.category,
      type: ProductType.Cbd,
      strainType: null,
      thcPercentage: 0,
      cbdPercentage: 10,
      unit: ProductUnit.Unit,
      price: MoneyInCents.create(10000),
      coverImageStorageKey: null,
      isActive: input.isActive ?? true,
    },
    input.id,
  );
  void repo.create(product);
}

function makeProducts() {
  const repo = new InMemoryProductRepository();
  seedProduct(repo, { id: "flor-1", category: ProductCategory.Flower });
  seedProduct(repo, { id: "oleo-1", category: ProductCategory.Oil });
  seedProduct(repo, { id: "oleo-2", category: ProductCategory.Oil, isActive: false });
  return repo;
}

const input = { organizationId: "org-1", patientId: "patient-1" } as const;

describe("GetPatientCatalogUseCase", () => {
  it("returns products released by product id or category, with distinct categories", async () => {
    const useCase = new GetPatientCatalogUseCase({
      productRepository: makeProducts(),
      patientRepository: new FakePatientRepository(PatientStatus.Approval),
      catalogAccessRepository: new FakeCatalogAccessRepository({
        productIds: ["flor-1"],
        categories: [ProductCategory.Oil],
      }),
    });

    const output = await useCase.execute(input);

    // flor-1 (by id) + oleo-1 (by OIL category); oleo-2 excluded (inactive).
    expect(output.products.map((product) => product.id).sort()).toEqual(["flor-1", "oleo-1"]);
    expect(output.categories.sort()).toEqual([ProductCategory.Flower, ProductCategory.Oil].sort());
  });

  it("returns an empty catalog when the patient is not approved", async () => {
    const useCase = new GetPatientCatalogUseCase({
      productRepository: makeProducts(),
      patientRepository: new FakePatientRepository(PatientStatus.WaitingDocuments),
      catalogAccessRepository: new FakeCatalogAccessRepository({
        productIds: ["flor-1"],
        categories: [ProductCategory.Oil],
      }),
    });

    const output = await useCase.execute(input);

    expect(output.products).toHaveLength(0);
    expect(output.categories).toHaveLength(0);
  });

  it("returns an empty catalog when the patient has no posology access", async () => {
    const useCase = new GetPatientCatalogUseCase({
      productRepository: makeProducts(),
      patientRepository: new FakePatientRepository(PatientStatus.Approval),
      catalogAccessRepository: new FakeCatalogAccessRepository(null),
    });

    const output = await useCase.execute(input);

    expect(output.products).toHaveLength(0);
  });
});
