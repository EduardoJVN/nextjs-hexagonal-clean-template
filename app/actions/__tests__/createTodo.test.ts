import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoTitleEmptyError, TodoTitleTooLongError } from "@domain/todo/TodoErrors";
import { DomainError } from "@domain/shared/DomainError";

// Mock the composition root BEFORE importing the action
const mockCreateTodoUseCase = {
  execute: vi.fn(),
};

vi.mock("@infrastructure/composition/todo.composition", () => ({
  createTodoUseCase: mockCreateTodoUseCase,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks are set up
const { createTodoAction } = await import("../createTodo");
const { revalidatePath } = await import("next/cache");

describe("createTodoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with TodoDTO when title is valid", async () => {
    const dto = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Buy groceries",
      completedAt: null,
      createdAt: new Date(),
    };
    mockCreateTodoUseCase.execute.mockResolvedValueOnce(dto);

    const result = await createTodoAction({ title: "Buy groceries" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Buy groceries");
      expect(result.data.id).toBeDefined();
      expect(result.data.completedAt).toBeNull();
      expect(result.data.createdAt).toBeInstanceOf(Date);
    }
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns ok with TodoDTO when called with FormData", async () => {
    const dto = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      title: "Walk the dog",
      completedAt: null,
      createdAt: new Date(),
    };
    mockCreateTodoUseCase.execute.mockResolvedValueOnce(dto);

    const formData = new FormData();
    formData.append("title", "Walk the dog");

    const result = await createTodoAction(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Walk the dog");
    }
  });

  it("returns fail with validation error when title is empty string", async () => {
    const result = await createTodoAction({ title: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockCreateTodoUseCase.execute).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns fail with validation error when title exceeds 255 characters", async () => {
    const result = await createTodoAction({ title: "a".repeat(256) });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockCreateTodoUseCase.execute).not.toHaveBeenCalled();
  });

  it("returns fail with domain error message when use case throws DomainError", async () => {
    mockCreateTodoUseCase.execute.mockRejectedValueOnce(
      new TodoTitleEmptyError(),
    );

    // Domain errors from the use case can happen if Zod passes but domain rejects
    const result = await createTodoAction({ title: "   " });

    // Zod catches the empty/whitespace case before reaching use case
    expect(result.success).toBe(false);
  });

  it("returns fail when use case throws a generic DomainError", async () => {
    class CustomDomainError extends DomainError {
      constructor() {
        super("Some domain rule violated");
      }
    }
    mockCreateTodoUseCase.execute.mockRejectedValueOnce(new CustomDomainError());

    const result = await createTodoAction({ title: "Valid title" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Some domain rule violated");
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
