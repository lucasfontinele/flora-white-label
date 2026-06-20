import type { OrganizationEmployee as PrismaOrganizationEmployee, Prisma } from "@prisma/client";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";

export class OrganizationEmployeeMapper {
  static toDomain(record: PrismaOrganizationEmployee): OrganizationEmployee {
    return OrganizationEmployee.create(
      {
        organizationId: record.organizationId,
        fullName: record.fullName,
        document: Document.create(record.document),
        isActive: record.isActive,
      },
      record.id,
    );
  }

  static toPersistence(
    employee: OrganizationEmployee,
  ): Prisma.OrganizationEmployeeUncheckedCreateInput {
    return {
      id: employee.id,
      organizationId: employee.organizationId,
      fullName: employee.fullName,
      document: employee.document.value,
      isActive: employee.isActive,
    };
  }
}
