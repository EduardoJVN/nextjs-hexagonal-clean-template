# CLAUDE.md — nextjs-hexagonal-clean-template

## What This Template Is

A production-ready Next.js 15 starter that enforces Hexagonal (Ports & Adapters) / Clean Architecture with strict layer boundaries, full TDD support, and Shadcn UI. Use it as the foundation for any new project that requires maintainability at scale.

---

## Commands

| Command | What It Does |
|---------|-------------|
| `pnpm dev` | Start the Next.js development server on :3000 |
| `pnpm test` | Run all unit + server tests via Vitest |
| `pnpm test:unit` | Run client-side unit tests only (jsdom environment) |
| `pnpm test:server` | Run server-side tests only (Node environment) |
| `pnpm test:coverage` | Run all tests with V8 coverage report |
| `pnpm test:e2e` | Run Playwright end-to-end tests (requires dev server) |
| `pnpm lint` | Run ESLint with Next.js rules + boundary enforcement |
| `pnpm type-check` | Run `tsc --noEmit` — no emit, just type validation |

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

| Layer | Path | Contents |
|-------|------|----------|
| Domain | `src/domain/` | Entities, Value Objects, Domain Errors, Repository interfaces (ports) |
| Application | `src/application/` | Use Cases, DTOs, Application Errors, Port interfaces |
| Infrastructure | `src/infrastructure/` | Repository implementations (in-memory, DB, etc.), Composition Root |
| Presentation | `components/`, `app/actions/` | React Server/Client Components, Server Actions |

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

| Source location | Test environment | Vitest project |
|----------------|-----------------|----------------|
| `src/domain/**/__tests__/` | jsdom | client |
| `src/application/**/__tests__/` | jsdom | client |
| `components/**/__tests__/` | jsdom | client |
| `src/infrastructure/**/__tests__/` | node | server |
| `app/actions/__tests__/` | node | server |
| `tests/e2e/` | — | Playwright |

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

| File | Loaded when | Commit? |
|------|------------|---------|
| `.env.example` | never (documentation only) | **yes** |
| `.env.local` | always, overrides everything | **no** |
| `.env.development` | `next dev` only | yes (no secrets) |
| `.env.production` | `next build` / `next start` only | yes (no secrets) |
| `.env.test` | Vitest / test runner only | yes (no secrets) |

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
- Server Actions and infrastructure adapters can read `process.env.MY_VAR` directly
- Pass values to use cases via constructor injection in the composition root — never read `process.env` inside domain or application layers

---

## Path Aliases

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `src/*` |
| `@domain/*` | `src/domain/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@components/*` | `components/*` |
| `@lib/*` | `lib/*` |
| `@actions/*` | `app/actions/*` |

Defined in both `tsconfig.json` and `vitest.config.ts`. Test files excluded from `tsc --noEmit` via `tsconfig.json` exclude list.

---

## How to Replace In-Memory Adapters with Real Ones

1. Create a new adapter in `src/infrastructure/repositories/` that implements the port from `src/domain/`.
2. Write tests for the new adapter (use a real DB connection or test container).
3. Open `src/infrastructure/composition/todo.composition.ts` and swap the import — replace the in-memory constructor call with the real one.
4. No other file changes required.

Example:
```typescript
// Before
import { InMemoryTodoRepository } from "../repositories/InMemoryTodoRepository";
const todoRepository = new InMemoryTodoRepository();

// After
import { PrismaTodoRepository } from "../repositories/PrismaTodoRepository";
const todoRepository = new PrismaTodoRepository(prismaClient);
```

---

## ESLint Boundary Enforcement

The `.eslintrc.json` contains two mechanisms:

1. **`no-restricted-imports` overrides per directory** — prevents domain files from importing application/infrastructure/next/react, and prevents application files from importing infrastructure/next.

2. **`import/no-restricted-paths`** — enforces directory-level import boundaries using the `eslint-plugin-import` path checker.

Run `pnpm lint` to validate boundaries. Fix violations before committing — CI enforces this.
