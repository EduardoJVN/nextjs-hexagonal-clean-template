import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApplicationError } from "@application/shared/ApplicationError";
import { TodoAlreadyCompletedError } from "@domain/todo/TodoErrors";

const mockCompleteTodoUseCase = {
  execute: vi.fn(),
};

vi.mock("@infrastructure/composition/todo.composition", () => ({
  completeTodoUseCase: mockCompleteTodoUseCase,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { completeTodoAction } = await import("../completeTodo");
const { revalidatePath } = await import("next/cache");

describe("completeTodoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with TodoDTO when todo is completed successfully", async () => {
    const dto = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Buy groceries",
      completedAt: new Date(),
      createdAt: new Date(),
    };
    mockCompleteTodoUseCase.execute.mockResolvedValueOnce(dto);

    const result = await completeTodoAction({
      id: "123e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("123e4567-e89b-12d3-a456-426614174000");
      expect(result.data.completedAt).not.toBeNull();
    }
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns fail when todo is not found (ApplicationError)", async () => {
    mockCompleteTodoUseCase.execute.mockRejectedValueOnce(
      new ApplicationError('Todo with id "unknown-id" not found'),
    );

    const result = await completeTodoAction({ id: "unknown-id" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("not found");
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns fail when todo is already completed (TodoAlreadyCompletedError)", async () => {
    mockCompleteTodoUseCase.execute.mockRejectedValueOnce(
      new TodoAlreadyCompletedError(),
    );

    const result = await completeTodoAction({ id: "some-id" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns fail with validation error when id is empty", async () => {
    const result = await completeTodoAction({ id: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockCompleteTodoUseCase.execute).not.toHaveBeenCalled();
  });
});
