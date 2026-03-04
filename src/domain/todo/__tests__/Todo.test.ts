import { describe, it, expect, beforeEach } from "vitest";
import { Todo } from "../Todo";
import {
  TodoTitleEmptyError,
  TodoAlreadyCompletedError,
} from "../TodoErrors";

describe("Todo", () => {
  describe("create()", () => {
    it("creates a Todo with a valid title", () => {
      const todo = Todo.create("Buy groceries");

      expect(todo).toBeDefined();
    });

    it("sets an id that is a non-empty string", () => {
      const todo = Todo.create("Buy groceries");

      expect(typeof todo.id.value).toBe("string");
      expect(todo.id.value.length).toBeGreaterThan(0);
    });

    it("sets the title correctly", () => {
      const todo = Todo.create("Buy groceries");

      expect(todo.title.value).toBe("Buy groceries");
    });

    it("sets completedAt to null initially", () => {
      const todo = Todo.create("Buy groceries");

      expect(todo.completedAt).toBeNull();
    });

    it("sets createdAt to a Date", () => {
      const todo = Todo.create("Buy groceries");

      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it("sets isCompleted to false initially", () => {
      const todo = Todo.create("Buy groceries");

      expect(todo.isCompleted).toBe(false);
    });

    it("throws TodoTitleEmptyError when created with an empty title", () => {
      expect(() => Todo.create("")).toThrow(TodoTitleEmptyError);
    });

    it("throws TodoTitleEmptyError when created with a whitespace title", () => {
      expect(() => Todo.create("   ")).toThrow(TodoTitleEmptyError);
    });

    it("each created todo has a unique id", () => {
      const a = Todo.create("Task A");
      const b = Todo.create("Task B");

      expect(a.id.value).not.toBe(b.id.value);
    });
  });

  describe("complete()", () => {
    let todo: Todo;

    beforeEach(() => {
      todo = Todo.create("Complete me");
    });

    it("transitions isCompleted from false to true", () => {
      todo.complete();

      expect(todo.isCompleted).toBe(true);
    });

    it("sets completedAt to a Date after completion", () => {
      todo.complete();

      expect(todo.completedAt).toBeInstanceOf(Date);
    });

    it("sets completedAt to approximately now", () => {
      const before = new Date();
      todo.complete();
      const after = new Date();

      expect(todo.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(todo.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("throws TodoAlreadyCompletedError when called a second time", () => {
      todo.complete();

      expect(() => todo.complete()).toThrow(TodoAlreadyCompletedError);
    });

    it("does not change completedAt if called twice (first value preserved)", () => {
      todo.complete();
      const firstCompletedAt = todo.completedAt;

      expect(() => todo.complete()).toThrow(TodoAlreadyCompletedError);
      expect(todo.completedAt).toBe(firstCompletedAt);
    });
  });

  describe("toPrimitives()", () => {
    it("returns a plain object with id, title, completedAt, createdAt", () => {
      const todo = Todo.create("Buy groceries");
      const primitives = todo.toPrimitives();

      expect(typeof primitives.id).toBe("string");
      expect(typeof primitives.title).toBe("string");
      expect(primitives.title).toBe("Buy groceries");
      expect(primitives.completedAt).toBeNull();
      expect(primitives.createdAt).toBeInstanceOf(Date);
    });

    it("reflects completedAt after completion", () => {
      const todo = Todo.create("Buy groceries");
      todo.complete();
      const primitives = todo.toPrimitives();

      expect(primitives.completedAt).toBeInstanceOf(Date);
    });

    it("returns a plain object (not a class instance)", () => {
      const todo = Todo.create("Buy groceries");
      const primitives = todo.toPrimitives();

      expect(primitives.constructor).toBe(Object);
    });
  });

  describe("reconstitute()", () => {
    it("reconstructs a pending todo from primitives", () => {
      const original = Todo.create("Reconstitute me");
      const primitives = original.toPrimitives();

      const reconstituted = Todo.reconstitute(primitives);

      expect(reconstituted.id.value).toBe(primitives.id);
      expect(reconstituted.title.value).toBe(primitives.title);
      expect(reconstituted.completedAt).toBeNull();
      expect(reconstituted.isCompleted).toBe(false);
    });

    it("reconstructs a completed todo from primitives", () => {
      const original = Todo.create("Done task");
      original.complete();
      const primitives = original.toPrimitives();

      const reconstituted = Todo.reconstitute(primitives);

      expect(reconstituted.isCompleted).toBe(true);
      expect(reconstituted.completedAt).toBeInstanceOf(Date);
    });

    it("preserves the exact same id as the original", () => {
      const original = Todo.create("Preserve id");
      const primitives = original.toPrimitives();

      const reconstituted = Todo.reconstitute(primitives);

      expect(reconstituted.id.value).toBe(original.id.value);
    });
  });
});
