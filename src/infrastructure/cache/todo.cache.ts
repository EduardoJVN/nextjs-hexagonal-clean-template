/**
 * Todo Cache Layer
 *
 * Wraps read use-case executions in React.cache() so that multiple Server
 * Components within the same SSR render tree share the result of a single
 * fetch — React deduplicates calls with the same arguments automatically.
 *
 * Write operations (createTodo, completeTodo) must NOT be cached because
 * they mutate state and must always execute.
 *
 * Usage: import { getCachedTodos } from "@infrastructure/cache"
 */
import { cache } from "react";
import { listTodosUseCase } from "@infrastructure/composition/todo.composition";

/** Returns all todos, deduplicated within the current request tree. */
export const getCachedTodos = cache(async () => {
  return listTodosUseCase.execute({});
});
