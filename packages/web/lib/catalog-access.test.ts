import { describe, expect, it } from "vitest";
import { canAccessCatalog } from "./catalog-access";

describe("canAccessCatalog", () => {
  it("allows access only when the patient is approved", () => {
    expect(canAccessCatalog("APPROVAL")).toBe(true);
  });

  it("blocks patients still going through registration", () => {
    expect(canAccessCatalog("WAITING_DOCUMENTS")).toBe(false);
    expect(canAccessCatalog("WAITING_APPROVAL")).toBe(false);
    expect(canAccessCatalog("REJECTED")).toBe(false);
  });

  it("blocks when the status is missing (no patient / unknown)", () => {
    expect(canAccessCatalog(null)).toBe(false);
    expect(canAccessCatalog(undefined)).toBe(false);
  });
});
