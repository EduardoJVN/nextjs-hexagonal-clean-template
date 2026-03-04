import { describe, it, expect, beforeEach } from "vitest";
import { CompleteTodoUseCase } from "../CompleteTodoUseCase";
import { ApplicationError } from "../../shared/ApplicationError";
import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";
import { TodoAlreadyCompletedError } from "@domain/todo/TodoErrors";

// In-memory stub — lives only in this test file
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

describe("CompleteTodoUseCase", () => {
  let repository: InMemoryTodoRepositoryStub;
  let useCase: CompleteTodoUseCase;

  beforeEach(() => {
    repository = new InMemoryTodoRepositoryStub();
    useCase = new CompleteTodoUseCase(repository);
  });

  it("completes an existing todo and returns DTO with completedAt set", async () => {
    const todo = Todo.create("Buy milk");
    await repository.save(todo);

    const dto = await useCase.execute({ id: todo.id.value });

    expect(dto.id).toBe(todo.id.value);
    expect(dto.completedAt).not.toBeNull();
    expect(dto.completedAt).toBeInstanceOf(Date);

    // Verify persistence — the saved todo must reflect the completed state
    const persisted = await repository.findById(todo.id);
    expect(persisted?.isCompleted).toBe(true);
  });

  it("throws ApplicationError when todo does not exist", async () => {
    await expect(
      useCase.execute({ id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow(ApplicationError);
  });

  it("throws ApplicationError with 'not found' message when todo does not exist", async () => {
    await expect(
      useCase.execute({ id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow("not found");
  });

  it("propagates TodoAlreadyCompletedError when todo is already completed", async () => {
    const todo = Todo.create("Already done");
    todo.complete();
    await repository.save(todo);

    await expect(useCase.execute({ id: todo.id.value })).rejects.toThrow(
      TodoAlreadyCompletedError,
    );
  });
});
