import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";

export class InMemoryTodoRepository implements ITodoRepository {
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
