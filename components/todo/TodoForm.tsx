"use client";

import { useState } from "react";
import { cn } from "@lib/utils";

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    try {
      await onSubmit(title.trim());
      setTitle("");
    } catch {
      // Keep the title in place so the user can retry
    }
  };

  const isDisabled = isLoading || title.trim().length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
      />
      <button
        type="submit"
        disabled={isDisabled}
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          isDisabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95",
        )}
      >
        Add Todo
      </button>
    </form>
  );
}
