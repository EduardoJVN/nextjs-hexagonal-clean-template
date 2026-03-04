import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryTodoRepository } from "../InMemoryTodoRepository";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";

// Port compliance tests — these test the CONTRACT defined by ITodoRepository,
// not internal implementation details of InMemoryTodoRepository.

describe("InMemoryTodoRepository — port compliance", () => {
  let repository: InMemoryTodoRepository;

  beforeEach(() => {
    repository = new InMemoryTodoRepository();
  });

  it("save then findById returns the same todo", async () => {
    const todo = Todo.create("Read the docs");
    await repository.save(todo);

    const found = await repository.findById(todo.id);

    expect(found).not.toBeNull();
    expect(found!.id.value).toBe(todo.id.value);
    expect(found!.toPrimitives().title).toBe("Read the docs");
  });

  it("saving a todo twice (update) — findById returns the updated todo", async () => {
    const todo = Todo.create("Write tests");
    await repository.save(todo);

    // Complete the todo to mutate state, then re-save (simulate an update)
    todo.complete();
    await repository.save(todo);

    const found = await repository.findById(todo.id);
    expect(found).not.toBeNull();
    expect(found!.isCompleted).toBe(true);
  });

  it("findAll returns all saved todos", async () => {
    await repository.save(Todo.create("First task"));
    await repository.save(Todo.create("Second task"));
    await repository.save(Todo.create("Third task"));

    const all = await repository.findAll();

    expect(all).toHaveLength(3);
    const titles = all.map((t) => t.toPrimitives().title);
    expect(titles).toContain("First task");
    expect(titles).toContain("Second task");
    expect(titles).toContain("Third task");
  });

  it("delete removes the todo — findById returns null afterwards", async () => {
    const todo = Todo.create("Temporary task");
    await repository.save(todo);

    await repository.delete(todo.id);

    const found = await repository.findById(todo.id);
    expect(found).toBeNull();
  });

  it("findById returns null for a non-existent id", async () => {
    const nonExistentId = TodoId.fromString("00000000-0000-0000-0000-000000000000");

    const found = await repository.findById(nonExistentId);

    expect(found).toBeNull();
  });

  it("delete does not affect other todos", async () => {
    const todoA = Todo.create("Keep me");
    const todoB = Todo.create("Delete me");
    await repository.save(todoA);
    await repository.save(todoB);

    await repository.delete(todoB.id);

    const all = await repository.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].id.value).toBe(todoA.id.value);
  });

  it("findAll returns empty array when no todos have been saved", async () => {
    const all = await repository.findAll();
    expect(all).toEqual([]);
  });
});
