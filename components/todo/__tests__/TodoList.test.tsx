import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "../TodoList";
import type { TodoDTO } from "@application/todo/dtos/TodoDTO";

const makeTodo = (id: string, title: string, completed = false): TodoDTO => ({
  id,
  title,
  completedAt: completed ? new Date() : null,
  createdAt: new Date("2024-01-01T10:00:00.000Z"),
});

describe("TodoList", () => {
  it("shows empty state message when todos array is empty", () => {
    render(<TodoList todos={[]} onComplete={vi.fn()} />);
    expect(screen.getByText("No todos yet")).toBeInTheDocument();
  });

  it("does not show empty state when there are todos", () => {
    const todos = [makeTodo("1", "Buy groceries")];
    render(<TodoList todos={todos} onComplete={vi.fn()} />);
    expect(screen.queryByText("No todos yet")).not.toBeInTheDocument();
  });

  it("renders the correct number of TodoItem components", () => {
    const todos = [
      makeTodo("1", "Buy groceries"),
      makeTodo("2", "Walk the dog"),
      makeTodo("3", "Read a book"),
    ];
    render(<TodoList todos={todos} onComplete={vi.fn()} />);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
    expect(screen.getByText("Read a book")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /complete/i })).toHaveLength(3);
  });

  it("passes onComplete down to each TodoItem", async () => {
    const onComplete = vi.fn();
    const todos = [makeTodo("abc-123", "Single task")];
    const user = userEvent.setup();

    render(<TodoList todos={todos} onComplete={onComplete} />);
    await user.click(screen.getByRole("button", { name: /complete/i }));

    expect(onComplete).toHaveBeenCalledWith("abc-123");
  });

  it("renders completed and non-completed todos together", () => {
    const todos = [
      makeTodo("1", "Done task", true),
      makeTodo("2", "Pending task", false),
    ];
    render(<TodoList todos={todos} onComplete={vi.fn()} />);

    expect(screen.getByText("Done task")).toBeInTheDocument();
    expect(screen.getByText("Pending task")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
