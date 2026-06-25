import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import type { MasterAccessRepository } from "../../application/repositories/MasterAccessRepository.js";

/**
 * Confirms master access with a single, cheap existence check: the user must
 * exist, be active and carry the `Master` profile. No entity hydration — this
 * is only used to authorize the request.
 */
export class PrismaMasterAccessRepository implements MasterAccessRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async isMaster(userId: string): Promise<boolean> {
    const user = await this.prisma.getClient().user.findFirst({
      where: { id: userId, profile: UserProfile.Master, isActive: true },
      select: { id: true },
    });

    return user !== null;
  }
}
