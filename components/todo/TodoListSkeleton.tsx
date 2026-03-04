/**
 * TodoListSkeleton
 *
 * Reusable skeleton placeholder for the todo list.
 * Matches the dimensions of real TodoItem cards.
 * Uses Tailwind animate-pulse for the skeleton effect.
 */
export function TodoListSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-label="Loading todos">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="flex animate-pulse items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
        >
          {/* Title placeholder */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          {/* Button placeholder */}
          <div className="h-7 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
        </li>
      ))}
    </ul>
  );
}
