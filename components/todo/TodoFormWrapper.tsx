"use client";

// Architecture: Presentation layer — thin client wrapper that bridges the
// Server Action (app/actions/createTodo.ts) to the TodoForm Client Component.
// This pattern allows page.tsx to stay a Server Component while the form
// still benefits from optimistic UI / useTransition.

import { useTransition } from "react";
import { TodoForm } from "./TodoForm";
import { createTodoAction } from "@actions/createTodo";

export function TodoFormWrapper() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (title: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await createTodoAction({ title });
          if (!result.success) {
            reject(new Error(result.error));
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  return <TodoForm onSubmit={handleSubmit} isLoading={isPending} />;
}
