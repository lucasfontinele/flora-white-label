import { describe, expect, it } from "vitest";
import { ListOrganizationRolesUseCase } from "./ListOrganizationRolesUseCase.js";
import { InMemoryRoleRepository } from "./access-control-test-utils.js";
import { Role } from "../../domain/entities/Role.js";
import { PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PermissionModule } from "../../domain/enums/PermissionModule.js";

describe("ListOrganizationRolesUseCase", () => {
  it("returns the organization's roles plus the permission catalog", async () => {
    const repository = new InMemoryRoleRepository();
    repository.seed(Role.create({ organizationId: "org-1", key: "OPERATOR", name: "Operador" }));
    repository.seed(Role.create({ organizationId: "org-2", key: "OPERATOR", name: "Operador" }));

    const useCase = new ListOrganizationRolesUseCase(repository);
    const result = await useCase.execute({ organizationId: "org-1" });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.organizationId).toBe("org-1");
    expect(result.catalog.modules).toContain(PermissionModule.Orders);
    expect(result.catalog.actions).toContain(PermissionAction.Approve);
    expect(result.catalog.modules).toHaveLength(7);
    expect(result.catalog.actions).toHaveLength(4);
  });
});
