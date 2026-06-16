# Phase 0 Research: Master Organization Form

## Decision: Create `packages/shared` as the contract source

**Rationale**: Organization payloads are now used by both `packages/web` and
`packages/api`. The constitution requires shared DTOs, enums, and TypeScript
interfaces to live in `packages/shared` once they cross package boundaries. A
dependency-light shared package avoids web importing API internals and avoids API
importing web schemas.

**Alternatives considered**:

- Keep duplicated local types in web and API. Rejected because the current
  feature explicitly requires shared contracts and duplicate types will drift.
- Generate TypeScript from OpenAPI immediately. Rejected for this slice because
  the repository does not yet have an OpenAPI generation toolchain; adding one
  would add process weight before the contracts stabilize.
- Put runtime Zod schemas in shared. Rejected for now because the API already
  has domain validation and `packages/shared` should remain free of UI/API
  dependencies. Web can use Zod for form UX while API remains authoritative.

## Decision: First CRUD slice means list/read plus create

**Rationale**: The user used "CRUD" but narrowed the requested implementation to
the listing screen and organization creation screen. The plan therefore covers
the end-to-end Create and Read paths only: list organizations, list plans, and
create organization.

**Alternatives considered**:

- Add edit and delete flows now. Rejected because they require additional domain
  rules for plan changes, organization lifecycle, audit behavior, and destructive
  operations that are outside the requested first screen/module slice.
- Build only the form and skip list. Rejected because the user explicitly asked
  for a listing table with relevant organization information and selected plan.

## Decision: Add a Master list endpoint for the table

**Rationale**: The existing API has partial create behavior and plan data, but
the Master table needs a stable list response. A `GET /organizations` endpoint
with pagination metadata gives the web table a clear read contract and prevents
the UI from depending on persistence details.

**Alternatives considered**:

- Reuse a future `GET /organizations/{id}` endpoint and fetch many IDs. Rejected
  because it does not support a table and would create unnecessary round trips.
- Seed the list in the front-end until a backend exists. Rejected because the
  feature requires connecting the front-end with real back-end endpoints.

## Decision: Use temporary Master headers until authentication exists

**Rationale**: The API already has a temporary Master plugin that reads
`x-master-user-id` and `x-master-role`. Keeping this contract explicit allows
local end-to-end integration now while preserving the later role boundary for
the real authentication module.

**Alternatives considered**:

- Disable authorization for local development. Rejected because it would hide
  the Master-only boundary and weaken tests.
- Implement the final authentication module in this feature. Rejected because
  the user explicitly said the module does not exist yet and the scope is
  organization list/create integration.

## Decision: Web validation is user-facing, API validation is authoritative

**Rationale**: The Master form should use the existing multi-step validated form
pattern, with field-level feedback before step progression. The API must still
validate all external input because front-end validation cannot be trusted.
Shared DTOs define shape; package-local validation enforces behavior at each
boundary.

**Alternatives considered**:

- Validate only in the front-end. Rejected because API accepts external input.
- Validate only in the API. Rejected because the form would provide poor UX and
  would not match the patient registration flow.

## Decision: Monetary values stay as integer cents everywhere

**Rationale**: The organization domain already requires plan prices to be stored
and handled in cents. The web may format prices for display, but shared and API
contracts expose `priceInCents` as an integer.

**Alternatives considered**:

- Send BRL decimal strings from the API. Rejected because it invites rounding
  and formatting drift.
- Convert only inside the database layer. Rejected because the front-end also
  needs cents-safe display and validation.
