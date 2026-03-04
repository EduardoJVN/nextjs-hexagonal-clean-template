import { describe, it, expect, vi, beforeEach } from "vitest";

const mockListTodosUseCase = {
  execute: vi.fn(),
};

vi.mock("@infrastructure/composition/todo.composition", () => ({
  listTodosUseCase: mockListTodosUseCase,
}));

const { listTodosAction } = await import("../listTodos");

describe("listTodosAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok with empty array when there are no todos", async () => {
    mockListTodosUseCase.execute.mockResolvedValueOnce([]);

    const result = await listTodosAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it("returns ok with list of TodoDTOs", async () => {
    const dtos = [
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Buy groceries",
        completedAt: null,
        createdAt: new Date(),
      },
      {
        id: "223e4567-e89b-12d3-a456-426614174001",
        title: "Walk the dog",
        completedAt: new Date(),
        createdAt: new Date(),
      },
    ];
    mockListTodosUseCase.execute.mockResolvedValueOnce(dtos);

    const result = await listTodosAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe("Buy groceries");
      expect(result.data[1].completedAt).not.toBeNull();
    }
  });

  it("returns ok with single item when one todo exists", async () => {
    const dtos = [
      {
        id: "323e4567-e89b-12d3-a456-426614174002",
        title: "Single task",
        completedAt: null,
        createdAt: new Date(),
      },
    ];
    mockListTodosUseCase.execute.mockResolvedValueOnce(dtos);

    const result = await listTodosAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });
});
