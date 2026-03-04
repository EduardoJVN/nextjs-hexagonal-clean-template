/**
 * Root-level loading.tsx
 *
 * Next.js App Router automatically renders this component as the Suspense
 * fallback for the root route segment while the page is streaming.
 * No "use client" needed — this is a React Server Component.
 */
import { TodoListSkeleton } from "@components/todo/TodoListSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Title placeholder */}
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

      {/* Subtitle placeholder */}
      <div className="mb-8 h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

      {/* Form placeholder */}
      <section className="mb-8">
        <div className="flex gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>
      </section>

      {/* Todo list skeleton */}
      <section>
        <TodoListSkeleton />
      </section>
    </div>
  );
}
