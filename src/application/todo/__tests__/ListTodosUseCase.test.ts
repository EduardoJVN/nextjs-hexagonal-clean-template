import { describe, it, expect, beforeEach } from "vitest";
import { ListTodosUseCase } from "../ListTodosUseCase";
import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";

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

describe("ListTodosUseCase", () => {
  let repository: InMemoryTodoRepositoryStub;
  let useCase: ListTodosUseCase;

  beforeEach(() => {
    repository = new InMemoryTodoRepositoryStub();
    useCase = new ListTodosUseCase(repository);
  });

  it("returns empty array when no todos exist", async () => {
    const result = await useCase.execute({});
    expect(result).toEqual([]);
  });

  it("returns all todos as DTOs", async () => {
    await repository.save(Todo.create("Task one"));
    await repository.save(Todo.create("Task two"));

    const result = await useCase.execute({});

    expect(result).toHaveLength(2);
    const titles = result.map((dto) => dto.title);
    expect(titles).toContain("Task one");
    expect(titles).toContain("Task two");
  });

  it("includes completed todos in the list", async () => {
    const todo = Todo.create("Complete me");
    todo.complete();
    await repository.save(todo);

    const result = await useCase.execute({});

    expect(result).toHaveLength(1);
    expect(result[0].completedAt).not.toBeNull();
    expect(result[0].completedAt).toBeInstanceOf(Date);
  });

  it("returns DTOs with all required fields", async () => {
    await repository.save(Todo.create("Check fields"));

    const result = await useCase.execute({});

    expect(result[0].id).toBeDefined();
    expect(typeof result[0].id).toBe("string");
    expect(result[0].title).toBe("Check fields");
    expect(result[0].completedAt).toBeNull();
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });
});
