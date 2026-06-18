/**
 * Normalized address returned by a zipcode (CEP) lookup, regardless of the
 * underlying provider. `zipcode` is digits only; `complement` may be absent.
 */
export interface ZipcodeAddress {
  zipcode: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Port for resolving an address from a Brazilian zipcode (CEP).
 *
 * Implementations live in the infrastructure layer (ViaCEP, BrasilAPI, ...).
 * Keeping this as an application-owned interface lets the use case stay unaware
 * of the concrete provider, so a failing provider can be swapped — or chained
 * behind a fallback — without touching application code.
 */
export interface AddressLookupProvider {
  /** Human-readable identifier used for logging and fallback diagnostics. */
  readonly name: string;

  /**
   * Resolves the address for a digits-only zipcode.
   *
   * @returns the address, or `null` when the provider is reachable but has no
   * match for the zipcode.
   * @throws when the provider cannot be reached or returns an unexpected error
   * (so a fallback can move on to the next provider).
   */
  lookup(zipcode: string): Promise<ZipcodeAddress | null>;
}
