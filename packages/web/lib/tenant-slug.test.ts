import { afterEach, describe, expect, it, vi } from "vitest";
import { extractSlugFromHost } from "./tenant-slug";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("extractSlugFromHost (localhost dev, default root)", () => {
  it("extracts the slug from a localhost subdomain with a port", () => {
    expect(extractSlugFromHost("vida-verde.localhost:3000")).toBe("vida-verde");
  });

  it("extracts the slug without a port", () => {
    expect(extractSlugFromHost("flor-de-lis.localhost")).toBe("flor-de-lis");
  });

  it("returns null for the apex and for empty hosts", () => {
    expect(extractSlugFromHost("localhost:3000")).toBeNull();
    expect(extractSlugFromHost("")).toBeNull();
    expect(extractSlugFromHost(null)).toBeNull();
  });

  it("ignores reserved subdomains", () => {
    expect(extractSlugFromHost("www.localhost")).toBeNull();
    expect(extractSlugFromHost("api.localhost:3000")).toBeNull();
  });
});

describe("extractSlugFromHost (production root)", () => {
  it("extracts the slug under the configured root domain", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "flora.app");

    expect(extractSlugFromHost("vida-verde.flora.app")).toBe("vida-verde");
    expect(extractSlugFromHost("flora.app")).toBeNull();
    expect(extractSlugFromHost("a.b.flora.app")).toBe("a");
  });

  it("returns null for hosts outside the root domain", () => {
    vi.stubEnv("NEXT_PUBLIC_ROOT_DOMAIN", "flora.app");

    expect(extractSlugFromHost("vida-verde.vercel.app")).toBeNull();
  });
});
