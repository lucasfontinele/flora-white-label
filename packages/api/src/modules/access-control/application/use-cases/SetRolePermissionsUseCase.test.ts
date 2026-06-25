import { describe, expect, it } from "vitest";
import { SetRolePermissionsUseCase } from "./SetRolePermissionsUseCase.js";
import { InMemoryRoleRepository, immediateUnitOfWork } from "./access-control-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Role } from "../../domain/entities/Role.js";
import { PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PermissionModule } from "../../domain/enums/PermissionModule.js";

function setup() {
  const repository = new InMemoryRoleRepository();
  const role = Role.create({
    organizationId: "org-1",
    key: "OPERATOR",
    name: "Operador",
    permissions: [{ module: PermissionModule.Orders, action: PermissionAction.View }],
  });
  repository.seed(role);

  const useCase = new SetRolePermissionsUseCase({
    roleRepository: repository,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, role, useCase };
}

describe("SetRolePermissionsUseCase", () => {
  it("replaces the role's permission grid", async () => {
    const { useCase, role, repository } = setup();

    const updated = await useCase.execute({
      organizationId: "org-1",
      roleId: role.id,
      permissions: [
        { module: PermissionModule.Orders, action: PermissionAction.View },
        { module: PermissionModule.Orders, action: PermissionAction.Approve },
        { module: PermissionModule.Associates, action: PermissionAction.View },
      ],
    });

    expect(updated.permissions).toHaveLength(3);
    expect(repository.replaceCalls).toBe(1);
  });

  it("rejects an unknown role", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({ organizationId: "org-1", roleId: "missing", permissions: [] }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a role from another organization", async () => {
    const { useCase, role } = setup();

    await expect(
      useCase.execute({ organizationId: "org-2", roleId: role.id, permissions: [] }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects editing a full-access role", async () => {
    const repository = new InMemoryRoleRepository();
    const superAdmin = Role.create({
      organizationId: "org-1",
      key: "SUPER_ADMIN",
      name: "Super administrador",
      fullAccess: true,
      permissions: [],
    });
    repository.seed(superAdmin);
    const useCase = new SetRolePermissionsUseCase({
      roleRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        roleId: superAdmin.id,
        permissions: [{ module: PermissionModule.Orders, action: PermissionAction.View }],
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(repository.replaceCalls).toBe(0);
  });
});
