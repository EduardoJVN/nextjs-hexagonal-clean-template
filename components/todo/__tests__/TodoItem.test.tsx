import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../TodoItem";
import type { TodoDTO } from "@application/todo/dtos/TodoDTO";

const baseTodo: TodoDTO = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Buy groceries",
  completedAt: null,
  createdAt: new Date("2024-01-01T10:00:00.000Z"),
};

describe("TodoItem", () => {
  it("renders the todo title", () => {
    render(<TodoItem todo={baseTodo} onComplete={vi.fn()} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("does not show Completed badge when todo is not completed", () => {
    render(<TodoItem todo={baseTodo} onComplete={vi.fn()} />);
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  it("shows Completed badge when todo has completedAt set", () => {
    const completedTodo: TodoDTO = {
      ...baseTodo,
      completedAt: new Date("2024-01-02T10:00:00.000Z"),
    };
    render(<TodoItem todo={completedTodo} onComplete={vi.fn()} />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders a Complete button when todo is not completed", () => {
    render(<TodoItem todo={baseTodo} onComplete={vi.fn()} />);
    const button = screen.getByRole("button", { name: /complete/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("Complete button is disabled when todo is already completed", () => {
    const completedTodo: TodoDTO = {
      ...baseTodo,
      completedAt: new Date(),
    };
    render(<TodoItem todo={completedTodo} onComplete={vi.fn()} />);
    const button = screen.getByRole("button", { name: /complete/i });
    expect(button).toBeDisabled();
  });

  it("calls onComplete with todo id when Complete button is clicked", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(<TodoItem todo={baseTodo} onComplete={onComplete} />);
    await user.click(screen.getByRole("button", { name: /complete/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000");
  });

  it("does not call onComplete when button is disabled (already completed)", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    const completedTodo: TodoDTO = { ...baseTodo, completedAt: new Date() };

    render(<TodoItem todo={completedTodo} onComplete={onComplete} />);
    await user.click(screen.getByRole("button", { name: /complete/i }));

    expect(onComplete).not.toHaveBeenCalled();
  });
});
