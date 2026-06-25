import { describe, expect, it } from "vitest";
import { Document } from "./Document.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

const VALID_MASKED = "111.444.777-35";
const VALID_DIGITS = "11144477735";

describe("Document (CPF)", () => {
  it("creates a valid document from a digits-only CPF", () => {
    expect(Document.create(VALID_DIGITS).value).toBe(VALID_DIGITS);
  });

  it("removes the mask and stores digits only", () => {
    expect(Document.create(VALID_MASKED).value).toBe(VALID_DIGITS);
  });

  it("rejects a CPF with invalid check digits", () => {
    expect(() => Document.create("123.456.789-00")).toThrow(DomainValidationError);
  });

  it("rejects a CPF formed by repeated digits", () => {
    expect(() => Document.create("000.000.000-00")).toThrow(DomainValidationError);
  });

  it("rejects an empty document", () => {
    expect(() => Document.create("")).toThrow(DomainValidationError);
  });

  it("compares by value", () => {
    expect(Document.create(VALID_MASKED).equals(Document.create(VALID_DIGITS))).toBe(true);
  });
});
