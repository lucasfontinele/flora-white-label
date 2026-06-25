import type {
  AddressLookupProvider,
  ZipcodeAddress,
} from "../../application/providers/AddressLookupProvider.js";

export interface FallbackLogger {
  warn(message: string): void;
}

/**
 * Composite {@link AddressLookupProvider} that tries an ordered list of
 * providers until one answers. This is what makes the lookup resilient: if the
 * primary provider (e.g. ViaCEP) is down, the next one (e.g. BrasilAPI) is used
 * transparently.
 *
 * - The first provider returning an address wins.
 * - A provider returning `null` (reachable, but no match) lets the search
 *   continue, in case another provider knows the zipcode.
 * - A throwing provider is skipped. If *every* provider throws, the last error
 *   is re-thrown so the failure surfaces instead of masquerading as "not found".
 */
export class FallbackAddressLookupProvider implements AddressLookupProvider {
  readonly name: string;

  constructor(
    private readonly providers: AddressLookupProvider[],
    private readonly logger?: FallbackLogger,
  ) {
    if (providers.length === 0) {
      throw new Error("FallbackAddressLookupProvider requires at least one provider.");
    }

    this.name = `fallback(${providers.map((provider) => provider.name).join(",")})`;
  }

  async lookup(zipcode: string): Promise<ZipcodeAddress | null> {
    let anyResponded = false;
    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        const address = await provider.lookup(zipcode);
        anyResponded = true;

        if (address) {
          return address;
        }
      } catch (error) {
        lastError = error;
        this.logger?.warn(
          `Address lookup provider "${provider.name}" failed for zipcode "${zipcode}": ${describeError(error)}`,
        );
      }
    }

    if (!anyResponded) {
      throw lastError ?? new Error("All address lookup providers failed.");
    }

    return null;
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
