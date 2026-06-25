import { PERMISSION_ACTIONS, type PermissionAction } from "../../domain/enums/PermissionAction.js";
import { PERMISSION_MODULES, type PermissionModule } from "../../domain/enums/PermissionModule.js";
import type { RoleReadModel, RoleRepository } from "../repositories/RoleRepository.js";

export interface ListOrganizationRolesInput {
  organizationId: string;
}

export interface PermissionCatalog {
  modules: PermissionModule[];
  actions: PermissionAction[];
}

export interface ListOrganizationRolesOutput {
  data: RoleReadModel[];
  catalog: PermissionCatalog;
}

export class ListOrganizationRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(input: ListOrganizationRolesInput): Promise<ListOrganizationRolesOutput> {
    const data = await this.roleRepository.findAllByOrganization(input.organizationId);

    return {
      data,
      catalog: {
        modules: PERMISSION_MODULES,
        actions: PERMISSION_ACTIONS,
      },
    };
  }
}
