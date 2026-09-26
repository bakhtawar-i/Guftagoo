---
name: Generated API client typings
description: Compatibility requirement for Orval-generated React Query mutation clients.
---

The React API client package should include both `dom` and `dom.iterable` in its TypeScript library settings when generated mutations use `Headers.entries()`.

**Why:** Query-only generated clients may typecheck without iterable DOM APIs, so the issue only appears after adding a request body and regenerating the client.

**How to apply:** If a new OpenAPI mutation causes a `Headers.entries` type error, check the client package's `lib` setting before changing generated files.