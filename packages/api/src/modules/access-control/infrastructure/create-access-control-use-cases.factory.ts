import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrganizationEmployeeRepository } from "../../organization-employees/infrastructure/prisma/PrismaOrganizationEmployeeRepository.js";
import { GetEmployeePermissionsUseCase } from "../application/use-cases/GetEmployeePermissionsUseCase.js";
import { ListOrganizationRolesUseCase } from "../application/use-cases/ListOrganizationRolesUseCase.js";
import { SetRolePermissionsUseCase } from "../application/use-cases/SetRolePermissionsUseCase.js";
import { PrismaRoleRepository } from "./prisma/PrismaRoleRepository.js";

export interface AccessControlUseCases {
  listOrganizationRolesUseCase: ListOrganizationRolesUseCase;
  setRolePermissionsUseCase: SetRolePermissionsUseCase;
  getEmployeePermissionsUseCase: GetEmployeePermissionsUseCase;
}

export function makeAccessControlUseCases(prisma: PrismaService): AccessControlUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const roleRepository = new PrismaRoleRepository(transactionManager);
  const organizationEmployeeRepository = new PrismaOrganizationEmployeeRepository(
    transactionManager,
  );

  return {
    listOrganizationRolesUseCase: new ListOrganizationRolesUseCase(roleRepository),
    setRolePermissionsUseCase: new SetRolePermissionsUseCase({
      roleRepository,
      unitOfWork: transactionManager,
    }),
    getEmployeePermissionsUseCase: new GetEmployeePermissionsUseCase({
      organizationEmployeeRepository,
      roleRepository,
    }),
  };
}
