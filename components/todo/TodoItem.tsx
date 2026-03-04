import { cn } from "@lib/utils";
import type { TodoDTO } from "@application/todo/dtos/TodoDTO";

interface TodoItemProps {
  todo: TodoDTO;
  onComplete: (id: string) => void;
}

export function TodoItem({ todo, onComplete }: TodoItemProps) {
  const isCompleted = todo.completedAt !== null;

  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-sm font-medium",
            isCompleted
              ? "text-slate-400 line-through dark:text-slate-500"
              : "text-slate-900 dark:text-slate-100",
          )}
        >
          {todo.title}
        </span>
        {isCompleted && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            Completed
          </span>
        )}
      </div>
      <button
        onClick={() => onComplete(todo.id)}
        disabled={isCompleted}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          isCompleted
            ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95",
        )}
      >
        Complete
      </button>
    </li>
  );
}
