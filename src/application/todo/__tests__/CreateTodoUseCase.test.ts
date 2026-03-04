import { describe, it, expect, beforeEach } from "vitest";
import { CreateTodoUseCase } from "../CreateTodoUseCase";
import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";
import { TodoTitleEmptyError, TodoTitleTooLongError } from "@domain/todo/TodoErrors";

// In-memory stub — lives only in this test file, never imported from infrastructure
class InMemoryTodoRepositoryStub implements ITodoRepository {
  private todos: Map<string, Todo> = new Map();

  async findAll(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async findById(id: TodoId): Promise<Todo | null> {
    return this.todos.get(id.value) ?? null;
  }

  async save(todo: Todo): Promise<void> {
    this.todos.set(todo.id.value, todo);
  }

  async delete(id: TodoId): Promise<void> {
    this.todos.delete(id.value);
  }
}

describe("CreateTodoUseCase", () => {
  let repository: InMemoryTodoRepositoryStub;
  let useCase: CreateTodoUseCase;

  beforeEach(() => {
    repository = new InMemoryTodoRepositoryStub();
    useCase = new CreateTodoUseCase(repository);
  });

  it("creates a todo and saves it — returns DTO with correct title", async () => {
    const dto = await useCase.execute({ title: "Buy groceries" });

    expect(dto.title).toBe("Buy groceries");
    expect(dto.id).toBeDefined();
    expect(typeof dto.id).toBe("string");
    expect(dto.completedAt).toBeNull();
    expect(dto.createdAt).toBeInstanceOf(Date);

    // Verify it was actually persisted
    const all = await repository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].toPrimitives().title).toBe("Buy groceries");
  });

  it("propagates TodoTitleEmptyError when title is empty", async () => {
    await expect(useCase.execute({ title: "" })).rejects.toThrow(TodoTitleEmptyError);
  });

  it("propagates TodoTitleEmptyError when title is only whitespace", async () => {
    await expect(useCase.execute({ title: "   " })).rejects.toThrow(TodoTitleEmptyError);
  });

  it("propagates TodoTitleTooLongError when title exceeds 255 characters", async () => {
    const longTitle = "a".repeat(256);
    await expect(useCase.execute({ title: longTitle })).rejects.toThrow(TodoTitleTooLongError);
  });
});
