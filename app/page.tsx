// Architecture layers:
//   Domain        → pure business rules (src/domain)
//   Application   → use cases / ports (src/application)
//   Infrastructure → adapters / repositories (src/infrastructure)
//   Presentation  → components (components/) + Server Actions (app/actions/)
//
// This page is a React Server Component — it renders the shell and delegates
// async data fetching to TodoListContainer (also an RSC).
// TodoFormWrapper is a Client Component; it calls the Server Action on submit.

import { Suspense } from "react";
import { TodoListContainer } from "@components/todo/TodoListContainer";
import { TodoFormWrapper } from "@components/todo/TodoFormWrapper";
import { TodoListSkeleton } from "@components/todo/TodoListSkeleton";

export default async function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Todo App</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Demonstrates Hexagonal / Clean Architecture with Next.js App Router and TDD.
      </p>

      {/* Client Component: bridges Server Action → TodoForm */}
      <section className="mb-8">
        <TodoFormWrapper />
      </section>

      {/* Async RSC: fetches todos via Server Action, renders list */}
      <section>
        <Suspense fallback={<TodoListSkeleton />}>
          <TodoListContainer />
        </Suspense>
      </section>
    </div>
  );
}
