import { TodoItem } from "./TodoItem";
import type { TodoDTO } from "@application/todo/dtos/TodoDTO";

interface TodoListProps {
  todos: TodoDTO[];
  onComplete: (id: string) => void;
}

export function TodoList({ todos, onComplete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No todos yet
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onComplete={onComplete} />
      ))}
    </ul>
  );
}
