import { describe, expect, it } from "vitest";
import { Email } from "./Email.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

describe("Email", () => {
  it("creates a valid email", () => {
    expect(Email.create("user@example.com").value).toBe("user@example.com");
  });

  it("normalizes to lowercase and trims surrounding whitespace", () => {
    expect(Email.create("  USER@Example.COM  ").value).toBe("user@example.com");
  });

  it("rejects a malformed email", () => {
    expect(() => Email.create("not-an-email")).toThrow(DomainValidationError);
  });

  it("rejects an empty email", () => {
    expect(() => Email.create("")).toThrow(DomainValidationError);
  });

  it("compares by value (case-insensitively after normalization)", () => {
    expect(Email.create("a@b.com").equals(Email.create("A@B.COM"))).toBe(true);
  });
});
