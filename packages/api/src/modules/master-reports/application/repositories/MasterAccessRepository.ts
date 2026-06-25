/**
 * Read-only port used to authorize master-only routes. The backoffice "rede"
 * reports are consumed exclusively by Master users (the platform operators), so
 * any route that exposes them must confirm the requester is an active Master
 * before returning data.
 */
export interface MasterAccessRepository {
  /** True only when `userId` belongs to an active `Master` user. */
  isMaster(userId: string): Promise<boolean>;
}
