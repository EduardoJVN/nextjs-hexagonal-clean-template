/**
 * TodoListContainer — React Server Component
 *
 * Fetches todos via the infrastructure cache layer (React.cache()) instead of
 * going through a Server Action. Server Components can call infrastructure
 * directly — Server Actions add unnecessary overhead for RSC-to-RSC calls
 * and bypass the deduplication benefit of React.cache().
 *
 * getCachedTodos deduplicates the underlying use case call within the same
 * SSR request tree, so multiple components can call it without extra fetches.
 */
import { getCachedTodos } from "@infrastructure/cache";
import { completeTodoAction } from "@actions/completeTodo";
import { TodoList } from "./TodoList";

export async function TodoListContainer() {
  const todos = await getCachedTodos();

  async function handleComplete(id: string) {
    "use server";
    await completeTodoAction({ id });
  }

  return <TodoList todos={todos} onComplete={handleComplete} />;
}
