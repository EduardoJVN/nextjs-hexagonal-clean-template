import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "../TodoForm";

describe("TodoForm", () => {
  it("renders a text input and a submit button", () => {
    render(<TodoForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add todo/i })).toBeInTheDocument();
  });

  it("submit button is disabled when title input is empty", () => {
    render(<TodoForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add todo/i })).toBeDisabled();
  });

  it("submit button is enabled when title has content", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "Buy groceries");

    expect(screen.getByRole("button", { name: /add todo/i })).not.toBeDisabled();
  });

  it("submit button is disabled when isLoading is true", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} isLoading={true} />);

    await user.type(screen.getByRole("textbox"), "Buy groceries");

    expect(screen.getByRole("button", { name: /add todo/i })).toBeDisabled();
  });

  it("calls onSubmit with the typed title when form is submitted", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TodoForm onSubmit={onSubmit} />);
    await user.type(screen.getByRole("textbox"), "Walk the dog");
    await user.click(screen.getByRole("button", { name: /add todo/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("Walk the dog");
  });

  it("clears the input after successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TodoForm onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Walk the dog");
    await user.click(screen.getByRole("button", { name: /add todo/i }));

    expect(input).toHaveValue("");
  });

  it("does not clear input if onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();

    render(<TodoForm onSubmit={onSubmit} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Some todo");
    await user.click(screen.getByRole("button", { name: /add todo/i }));

    // Input should still have value since submit failed
    expect(input).toHaveValue("Some todo");
  });
});
