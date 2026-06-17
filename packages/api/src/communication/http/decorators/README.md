# Authorization Decorator

`Authorization()` creates a reusable Fastify pre-handler for future protected
routes. This feature only introduces the marker and isolated tests for it.

Do not apply `Authorization()` to existing production endpoints until a later
feature defines endpoint-specific access policy.
