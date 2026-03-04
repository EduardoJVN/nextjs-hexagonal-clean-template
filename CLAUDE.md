# CLAUDE.md — nextjs-hexagonal-clean-template

## What This Template Is

A production-ready Next.js 15 starter that enforces Hexagonal (Ports & Adapters) / Clean Architecture with strict layer boundaries, full TDD support, and Shadcn UI. Use it as the foundation for any new project that requires maintainability at scale.

---

## Commands

| Command              | What It Does                                          |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Start the Next.js development server on :3000         |
| `pnpm test`          | Run all unit + server tests via Vitest                |
| `pnpm test:unit`     | Run client-side unit tests only (jsdom environment)   |
| `pnpm test:server`   | Run server-side tests only (Node environment)         |
| `pnpm test:coverage` | Run all tests with V8 coverage report                 |
| `pnpm test:e2e`      | Run Playwright end-to-end tests (requires dev server) |
| `pnpm lint`          | Run ESLint with Next.js rules + boundary enforcement  |
| `pnpm type-check`    | Run `tsc --noEmit` — no emit, just type validation    |

---

## Git Hooks (Husky)

| Hook         | Trigger      | What runs                                            |
| ------------ | ------------ | ---------------------------------------------------- |
| `commit-msg` | every commit | commitlint — validates message format                |
| `pre-commit` | every commit | lint-staged — ESLint + Prettier on staged files only |
| `pre-push`   | every push   | `pnpm test` — full unit + server test suite          |

E2E tests (Playwright) are intentionally excluded from pre-push — they require a running dev server.

### Conventional Commits format

```
<type>(<scope>): <subject>

feat(auth): add JWT token refresh
fix(todo): prevent double-complete on concurrent requests
test(domain): add edge cases for TodoTitle value object
chore(deps): upgrade next to 15.3.0
```

**Allowed types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` · `ci` · `revert`

Rules enforced by commitlint (`commitlint.config.ts`):

- type must be from the list above
- subject must be lowercase
- subject must not end with a period
- header max 100 chars

### Skip hooks (emergency only)

```bash
git commit --no-verify   # skip commit-msg + pre-commit
git push --no-verify     # skip pre-push tests
```

---

## Architecture Overview

### Layer Diagram

```
  ┌──────────────────────────────────────────────────────┐
  │                    Presentation                      │
  │   components/   +   app/actions/   (Server Actions)  │
  └────────────────────────┬─────────────────────────────┘
                           │ calls
  ┌────────────────────────▼─────────────────────────────┐
  │                   Infrastructure                     │
  │          src/infrastructure/  (adapters, repos)      │
  └────────────────────────┬─────────────────────────────┘
                           │ implements
  ┌────────────────────────▼─────────────────────────────┐
  │                    Application                       │
  │        src/application/  (use cases, ports/DTOs)     │
  └────────────────────────┬─────────────────────────────┘
                           │ uses
  ┌────────────────────────▼─────────────────────────────┐
  │                      Domain                         │
  │         src/domain/  (entities, value objects)       │
  └──────────────────────────────────────────────────────┘
```

**Dependency rule**: arrows point INWARD only. Inner layers never import from outer layers.

### What Lives in Each Layer

| Layer          | Path                          | Contents                                                              |
| -------------- | ----------------------------- | --------------------------------------------------------------------- |
| Domain         | `src/domain/`                 | Entities, Value Objects, Domain Errors, Repository interfaces (ports) |
| Application    | `src/application/`            | Use Cases, DTOs, Application Errors, Port interfaces                  |
| Infrastructure | `src/infrastructure/`         | Repository implementations (in-memory, DB, etc.), Composition Root    |
| Presentation   | `components/`, `app/actions/` | React Server/Client Components, Server Actions                        |

### Where Server Actions Live

Server Actions sit in `app/actions/` and belong to the **Presentation layer**. They:

1. Validate raw input with Zod
2. Call the relevant Use Case (Application layer)
3. Call `revalidatePath` / `revalidateTag` to bust the Next.js cache
4. Return a typed `ActionResult<T>` — never throw to the client

This keeps the Application and Domain layers free of Next.js dependencies.

### Composition Root

`src/infrastructure/composition/todo.composition.ts` wires repositories to use cases. This is the ONLY place where concrete adapter instances are created and injected. Swap implementations here — nowhere else.

---

## Vitest Environments

Tests are co-located in `__tests__/` folders next to the source file they test.

| Source location                    | Test environment | Vitest project |
| ---------------------------------- | ---------------- | -------------- |
| `src/domain/**/__tests__/`         | jsdom            | client         |
| `src/application/**/__tests__/`    | jsdom            | client         |
| `components/**/__tests__/`         | jsdom            | client         |
| `src/infrastructure/**/__tests__/` | node             | server         |
| `app/actions/__tests__/`           | node             | server         |
| `tests/e2e/`                       | —                | Playwright     |

Run a single project: `pnpm test:unit` (client) or `pnpm test:server` (server).

---

## TDD Workflow: How to Add a New Feature

Follow this order — never skip steps.

1. **Domain test first** (`src/domain/{aggregate}/__tests__/`)
   Write a test for the Entity or Value Object behaviour. Red → implement the domain class → Green.

2. **Use Case test** (`src/application/{aggregate}/__tests__/`)
   Write a test using an inline in-memory stub (not the real `InMemoryRepository`). Red → implement the use case → Green.

3. **Infrastructure test** (`src/infrastructure/adapters/in-memory/__tests__/`)
   Test the concrete repository adapter. Red → implement → Green.

4. **Server Action test** (`app/actions/__tests__/`)
   Mock the composition root module (`vi.mock("@infrastructure/composition/..."`). Red → implement → Green.

5. **Component test** (`components/{domain}/__tests__/`)
   Test the React component in isolation with props only. Red → implement → Green.

6. **E2E test** (`tests/e2e/`)
   Write a Playwright test for the full user journey. Validates the entire vertical slice.

---

## Environment Variables

Next.js loads `.env` files natively — **no dotenv needed**.

| File               | Loaded when                      | Commit?          |
| ------------------ | -------------------------------- | ---------------- |
| `.env.example`     | never (documentation only)       | **yes**          |
| `.env.local`       | always, overrides everything     | **no**           |
| `.env.development` | `next dev` only                  | yes (no secrets) |
| `.env.production`  | `next build` / `next start` only | yes (no secrets) |
| `.env.test`        | Vitest / test runner only        | yes (no secrets) |

**Setup for a new dev:**

```bash
cp .env.example .env.local
# fill in real values in .env.local
```

**Rules:**

- `NEXT_PUBLIC_` prefix → exposed to the browser (client-side bundle)
- No prefix → server-side only (Server Components, Server Actions, API routes)
- Never put secrets in `NEXT_PUBLIC_*` variables

**Accessing env vars in the architecture:**

- **Never** read `process.env` directly in domain or application layers
- Import `serverEnv` in: Server Actions, infrastructure adapters, composition root
- Import `clientEnv` in: Client Components that need public config

**Config files:**

| File                       | Purpose                                                          | Import in                                        |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| `lib/config/env.server.ts` | Validates all vars including secrets — throws on boot if invalid | Server Actions, Infrastructure, Composition Root |
| `lib/config/env.client.ts` | Only `NEXT_PUBLIC_*` vars — safe for browser                     | Client Components                                |

**Adding a new env var:**

1. Add to `.env.example` with a comment
2. Add to `.env.local` with the real value
3. Add to the Zod schema in `env.server.ts` (secrets) or `env.client.ts` (public)
4. For `NEXT_PUBLIC_*` vars: add the key explicitly in `validateClientEnv()` — Next.js requires static references, not `process.env[key]`

**Important — `NEXT_PUBLIC_*` static references:**

```typescript
// env.client.ts — CORRECT: explicit reference
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, // ← must be literal
});

// WRONG: Next.js bundler cannot replace dynamic access
const key = "NEXT_PUBLIC_APP_URL";
process.env[key]; // ← undefined at runtime in the browser
```

---

## Path Aliases

| Alias               | Resolves to            |
| ------------------- | ---------------------- |
| `@/*`               | `src/*`                |
| `@domain/*`         | `src/domain/*`         |
| `@application/*`    | `src/application/*`    |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@components/*`     | `components/*`         |
| `@lib/*`            | `lib/*`                |
| `@actions/*`        | `app/actions/*`        |

Defined in both `tsconfig.json` and `vitest.config.ts`. Test files excluded from `tsc --noEmit` via `tsconfig.json` exclude list.

---

## HTTP Client & External API

Set `API_BASE_URL` in `.env.local` — the composition root switches automatically from `InMemoryTodoRepository` to `HttpTodoRepository`. No code changes needed.

**Call flow:**

```
Server Action → Use Case → ITodoRepository
                                ↓
                    HttpTodoRepository (adapter)
                                ↓
                    IHttpClient (port) ← FetchHttpClient (adapter)
                                ↓
                          External REST API
```

**Anti-Corruption Layer (ACL):** the external API uses its own field names (`todo_id`, `todo_title`, `is_done`). `TodoApiMapper` translates between API shape ↔ domain model. Never let the API shape leak into domain.

```
src/infrastructure/acl/todo/
├── TodoApiTypes.ts   ← external API response/payload types
└── TodoApiMapper.ts  ← toDomain() + toPayload()
```

**HTTP Error hierarchy:**

```
HttpError
├── NetworkError              — connection failure
└── ApiError
    ├── UnauthorizedError     — 401
    ├── ForbiddenError        — 403
    ├── NotFoundError         — 404
    └── ServiceUnavailableError — 503
```

`HttpTodoRepository.findById()` catches `NotFoundError` → returns `null`. All other errors propagate to the Server Action → `fail(error.message)`.

**Adding a new domain's HTTP adapter:**

1. Define API types in `src/infrastructure/acl/{domain}/TodoApiTypes.ts`
2. Create mapper `TodoApiMapper.ts` with `toDomain()` + `toPayload()`
3. Create `Http{Domain}Repository` implementing the domain port
4. Wire in `src/infrastructure/composition/{domain}.composition.ts`

---

## Security Headers

Defined in `next.config.ts` for all routes: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. `unsafe-eval` and `unsafe-inline` in CSP are required by Next.js — tighten with nonces in production if needed.

---

## How to Replace In-Memory Adapters with Real Ones

Set `API_BASE_URL` in `.env.local` to activate `HttpTodoRepository` automatically via the composition root. For a DB adapter instead:

1. Implement the domain port (`ITodoRepository`) in `src/infrastructure/adapters/{db}/`
2. Write port compliance tests
3. Update `src/infrastructure/composition/todo.composition.ts` to instantiate the new adapter

---

## Loading States

`app/loading.tsx` — Next.js renders this automatically while the route segment is loading (Suspense boundary). Shows an `animate-pulse` skeleton matching the page layout.

`components/todo/TodoListSkeleton.tsx` — reusable skeleton for the todo list. Use in Suspense fallbacks in nested layouts.

Add per-route loading by creating `app/{route}/loading.tsx` — Next.js picks it up automatically.

---

## React.cache() — Request Deduplication

`src/infrastructure/cache/todo.cache.ts` wraps read use cases in `React.cache()`. Multiple Server Components calling `getCachedTodos()` in the same SSR request tree will only trigger one actual use case execution.

```typescript
// ✅ Use this in Server Components — not Server Actions
import { getCachedTodos } from "@infrastructure/cache";
const todos = await getCachedTodos();

// ❌ Don't route RSC → RSC through Server Actions — adds serialization overhead
const result = await listTodosAction();
```

Write operations (create, complete, delete) go through Server Actions — they are intentionally NOT cached.

---

## MSW — API Mocking

`src/infrastructure/http/mocks/` contains MSW handler definitions that intercept real `fetch` calls.

**In tests (Node/Vitest):** the MSW server is started automatically via `tests/setup.server.ts`. All server-environment tests run against the mock API by default. Override specific routes per test:

```typescript
import { server } from "@infrastructure/http/mocks";
import { http, HttpResponse } from "msw";

server.use(http.get("*/todos", () => HttpResponse.json([])));
```

**In dev (browser):** import and start the worker in your app entry point:

```typescript
// app/layout.tsx or a client component
import { worker } from "@infrastructure/http/mocks/browser";
if (process.env.NODE_ENV === "development") {
  await worker.start();
}
```

---

## Retry Logic

`FetchHttpClient` retries automatically on transient failures. Default: 3 attempts, 300ms initial delay, 2x backoff.

```typescript
new FetchHttpClient(baseUrl, {
  retry: { attempts: 3, delayMs: 300, backoffFactor: 2 },
});
```

Retries on: `NetworkError`, `ServiceUnavailableError` (503).
Does NOT retry on: 4xx errors — these are client errors, retrying won't help.

---

## ESLint Boundary Enforcement

The `.eslintrc.json` contains two mechanisms:

1. **`no-restricted-imports` overrides per directory** — prevents domain files from importing application/infrastructure/next/react, and prevents application files from importing infrastructure/next.

2. **`import/no-restricted-paths`** — enforces directory-level import boundaries using the `eslint-plugin-import` path checker.

Run `pnpm lint` to validate boundaries. Fix violations before committing — CI enforces this.
