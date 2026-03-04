# nextjs-hexagonal-clean-template

A production-ready Next.js 15 template implementing Hexagonal (Ports & Adapters) / Clean Architecture with strict layer boundaries, TDD from day one, and Shadcn UI components. Start every serious project here.

---

## Architecture

```
  Presentation  ─────────────────────────────────────────
  components/  +  app/actions/  (Server Actions)
        │
        ▼ calls
  Infrastructure  ────────────────────────────────────────
  src/infrastructure/  (concrete adapters, repos)
        │
        ▼ implements
  Application  ───────────────────────────────────────────
  src/application/  (use cases, ports, DTOs)
        │
        ▼ defines
  Domain  ────────────────────────────────────────────────
  src/domain/  (entities, value objects, domain errors)
```

Inner layers have ZERO knowledge of outer layers. The dependency rule is enforced by ESLint on every `pnpm lint` run.

---

## Quick Start

```bash
git clone https://github.com/your-org/nextjs-hexagonal-clean-template.git my-project
cd my-project
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Test Commands

```bash
pnpm test              # All unit + server tests (Vitest)
pnpm test:unit         # Client-side unit tests only
pnpm test:server       # Server-side tests only
pnpm test:coverage     # Tests + V8 coverage report
pnpm test:e2e          # Playwright end-to-end tests
```

---

## Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict) |
| UI | React 19, Shadcn UI, Tailwind CSS v3 |
| Theming | next-themes (system / light / dark) |
| Validation | Zod 4 |
| Unit testing | Vitest 3 + Testing Library |
| E2E testing | Playwright |
| Linting | ESLint + @typescript-eslint + eslint-plugin-import |

---

## How to Extend

**Add a new domain concept** (e.g., `Project`):
1. Create `src/domain/project/` — add the entity, value objects, and repository port.
2. Create `src/application/project/` — add the use case(s) and DTOs.
3. Create `src/infrastructure/repositories/InMemoryProjectRepository.ts` — implement the port.
4. Wire it in `src/infrastructure/composition/project.composition.ts`.
5. Create Server Actions in `app/actions/` and components in `components/project/`.

Follow the TDD workflow: domain tests first, then use case, then infrastructure, then action, then component.
