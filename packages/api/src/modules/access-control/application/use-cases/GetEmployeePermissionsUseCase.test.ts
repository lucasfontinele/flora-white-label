import { describe, expect, it } from "vitest";
import { GetEmployeePermissionsUseCase } from "./GetEmployeePermissionsUseCase.js";
import { InMemoryRoleRepository } from "./access-control-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { OrganizationEmployeeRepository } from "../../../organization-employees/application/repositories/OrganizationEmployeeRepository.js";
import { OrganizationEmployee } from "../../../organization-employees/domain/entities/OrganizationEmployee.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { Role } from "../../domain/entities/Role.js";
import { PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PermissionModule } from "../../domain/enums/PermissionModule.js";

const VALID_CPF = "39053344705";

class FakeEmployeeRepository implements OrganizationEmployeeRepository {
  constructor(private readonly employees: OrganizationEmployee[]) {}

  async findById(id: string): Promise<OrganizationEmployee | null> {
    return this.employees.find((employee) => employee.id === id) ?? null;
  }

  async findByDocument(): Promise<OrganizationEmployee | null> {
    return null;
  }

  async findRoleAssignment(employeeId: string) {
    const employee = this.employees.find((entry) => entry.id === employeeId);

    return employee
      ? { id: employee.id, organizationId: employee.organizationId, roleId: employee.roleId }
      : null;
  }

  async create(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

function buildEmployee(roleId: string | null) {
  return OrganizationEmployee.create(
    {
      organizationId: "org-1",
      fullName: "Maria",
      document: Document.create(VALID_CPF),
      isActive: true,
      roleId,
    },
    "emp-1",
  );
}

describe("GetEmployeePermissionsUseCase", () => {
  it("returns the role's effective permissions for the employee", async () => {
    const roleRepository = new InMemoryRoleRepository();
    roleRepository.seed(
      Role.create(
        {
          organizationId: "org-1",
          key: "OPERATOR",
          name: "Operador",
          permissions: [{ module: PermissionModule.Orders, action: PermissionAction.View }],
        },
        "role-1",
      ),
    );
    const useCase = new GetEmployeePermissionsUseCase({
      organizationEmployeeRepository: new FakeEmployeeRepository([buildEmployee("role-1")]),
      roleRepository,
    });

    const result = await useCase.execute({ organizationId: "org-1", employeeId: "emp-1" });

    expect(result.roleName).toBe("Operador");
    expect(result.permissions).toHaveLength(1);
    expect(result.fullAccess).toBe(false);
  });

  it("returns no permissions when the employee has no role", async () => {
    const useCase = new GetEmployeePermissionsUseCase({
      organizationEmployeeRepository: new FakeEmployeeRepository([buildEmployee(null)]),
      roleRepository: new InMemoryRoleRepository(),
    });

    const result = await useCase.execute({ organizationId: "org-1", employeeId: "emp-1" });

    expect(result.roleId).toBeNull();
    expect(result.permissions).toHaveLength(0);
    expect(result.fullAccess).toBe(false);
  });

  it("rejects an employee from another organization", async () => {
    const useCase = new GetEmployeePermissionsUseCase({
      organizationEmployeeRepository: new FakeEmployeeRepository([buildEmployee("role-1")]),
      roleRepository: new InMemoryRoleRepository(),
    });

    await expect(
      useCase.execute({ organizationId: "org-2", employeeId: "emp-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
