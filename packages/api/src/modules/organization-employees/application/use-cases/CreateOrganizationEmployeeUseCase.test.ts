import { beforeEach, describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import {
  InMemoryAddressRepository,
  InMemoryOrganizationRepository,
  InMemorySubscriptionPlanRepository,
  TrackingUnitOfWork,
  makeOrganization,
} from "../../../organizations/application/use-cases/organization-use-case-test-utils.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { User } from "../../../users/domain/entities/User.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import { PasswordHash } from "../../../users/domain/value-objects/PasswordHash.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";
import type { OrganizationEmployeeRepository } from "../repositories/OrganizationEmployeeRepository.js";
import { CreateOrganizationEmployeeUseCase } from "./CreateOrganizationEmployeeUseCase.js";

class InMemoryOrganizationEmployeeRepository implements OrganizationEmployeeRepository {
  readonly employees: OrganizationEmployee[] = [];
  readonly created: OrganizationEmployee[] = [];

  async findById(id: string): Promise<OrganizationEmployee | null> {
    return this.employees.find((employee) => employee.id === id) ?? null;
  }

  async findByDocument(
    organizationId: string,
    document: Document,
  ): Promise<OrganizationEmployee | null> {
    return (
      this.employees.find(
        (employee) =>
          employee.organizationId === organizationId && employee.document.value === document.value,
      ) ?? null
    );
  }

  async create(employee: OrganizationEmployee): Promise<void> {
    this.employees.push(employee);
    this.created.push(employee);
  }
}

class InMemoryUserRepository implements UserRepository {
  readonly users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email.value === email.value) ?? null;
  }

  async findByEmailInOrganization(organizationId: string, email: Email): Promise<User | null> {
    return (
      this.users.find(
        (user) => user.organizationId === organizationId && user.email.value === email.value,
      ) ?? null
    );
  }

  async create(user: User): Promise<void> {
    this.users.push(user);
  }

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((current) => current.id === user.id);
    if (index >= 0) this.users[index] = user;
    else this.users.push(user);
  }
}

function makeUser(id = "user-1", organizationId = "organization-1", email = "operadora@org.dev"): User {
  return User.create(
    {
      organizationId,
      email: Email.create(email),
      passwordHash: PasswordHash.fromHash("hashed-secret"),
      profile: UserProfile.Organization,
    },
    id,
  );
}

function makeSut() {
  const employeeRepository = new InMemoryOrganizationEmployeeRepository();
  const organizationRepository = new InMemoryOrganizationRepository(
    new InMemoryAddressRepository(),
    new InMemorySubscriptionPlanRepository(),
  );
  const userRepository = new InMemoryUserRepository();
  const unitOfWork = new TrackingUnitOfWork();

  organizationRepository.organizations.push(makeOrganization()); // id "organization-1"
  userRepository.users.push(makeUser());

  const sut = new CreateOrganizationEmployeeUseCase({
    organizationEmployeeRepository: employeeRepository,
    organizationRepository,
    userRepository,
    unitOfWork,
  });

  return { sut, employeeRepository, organizationRepository, userRepository, unitOfWork };
}

const validInput = {
  organizationId: "organization-1",
  userId: "user-1",
  fullName: "Maria Operadora",
  document: "529.982.247-25",
};

describe("CreateOrganizationEmployeeUseCase", () => {
  let context: ReturnType<typeof makeSut>;

  beforeEach(() => {
    context = makeSut();
  });

  it("creates an active employee and links it to the user", async () => {
    const employee = await context.sut.execute(validInput);

    expect(employee.organizationId).toBe("organization-1");
    expect(employee.fullName).toBe("Maria Operadora");
    expect(employee.document.value).toBe("52998224725");
    expect(employee.isActive).toBe(true);
    expect(context.employeeRepository.created).toHaveLength(1);
    expect(context.unitOfWork.calls).toBe(1);

    const user = await context.userRepository.findById("user-1");
    expect(user?.organizationEmployeeId).toBe(employee.id);
  });

  it("throws NotFoundError when the organization does not exist", async () => {
    await expect(
      context.sut.execute({ ...validInput, organizationId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError when the user does not exist", async () => {
    await expect(context.sut.execute({ ...validInput, userId: "missing" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("throws ConflictError when the user belongs to another organization", async () => {
    context.userRepository.users.push(makeUser("user-2", "other-org", "outra@org.dev"));

    await expect(context.sut.execute({ ...validInput, userId: "user-2" })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("throws ConflictError when the user is already an employee", async () => {
    context.userRepository.users[0]?.linkOrganizationEmployee("existing-employee");

    await expect(context.sut.execute(validInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws ConflictError when the document is already used in the organization", async () => {
    context.employeeRepository.employees.push(
      OrganizationEmployee.create({
        organizationId: "organization-1",
        fullName: "Outro",
        document: Document.create("529.982.247-25"),
        isActive: true,
      }),
    );

    await expect(context.sut.execute(validInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws DomainValidationError for an invalid CPF before persisting", async () => {
    await expect(context.sut.execute({ ...validInput, document: "111" })).rejects.toBeInstanceOf(
      DomainValidationError,
    );
    expect(context.employeeRepository.created).toHaveLength(0);
  });
});
