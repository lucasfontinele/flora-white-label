/**
 * Raised when the requester is authenticated/identified but not allowed to
 * perform the action (e.g. a user whose access has been disabled). Maps to HTTP
 * 403 in the presentation layer.
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
