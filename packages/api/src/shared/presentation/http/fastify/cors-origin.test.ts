import { describe, expect, it } from "vitest";
import { createCorsOriginDelegate, isOriginAllowed } from "./cors-origin.js";

describe("isOriginAllowed", () => {
  const options = { domains: ["localhost", "flora.app"], exactOrigins: ["https://marketing.example"] };

  it("allows any subdomain of a configured base domain on any port", () => {
    expect(isOriginAllowed("http://ise.localhost:3000", options)).toBe(true);
    expect(isOriginAllowed("http://localhost:5173", options)).toBe(true);
    expect(isOriginAllowed("https://ise.flora.app", options)).toBe(true);
    expect(isOriginAllowed("https://a.b.flora.app", options)).toBe(true);
  });

  it("allows the apex of a base domain and exact origins", () => {
    expect(isOriginAllowed("http://localhost", options)).toBe(true);
    expect(isOriginAllowed("https://marketing.example", options)).toBe(true);
  });

  it("allows requests without an Origin header (server-to-server, curl)", () => {
    expect(isOriginAllowed(undefined, options)).toBe(true);
  });

  it("rejects unrelated and look-alike domains", () => {
    expect(isOriginAllowed("https://evil.com", options)).toBe(false);
    expect(isOriginAllowed("https://notflora.app", options)).toBe(false);
    expect(isOriginAllowed("https://flora.app.evil.com", options)).toBe(false);
    expect(isOriginAllowed("not-a-url", options)).toBe(false);
  });
});

describe("createCorsOriginDelegate", () => {
  it("calls back allowing matching origins and blocking others", () => {
    const delegate = createCorsOriginDelegate({ domains: ["localhost"] });

    delegate("http://ise.localhost:3000", (error, allow) => {
      expect(error).toBeNull();
      expect(allow).toBe(true);
    });
    delegate("https://evil.com", (error, allow) => {
      expect(error).toBeNull();
      expect(allow).toBe(false);
    });
  });
});
