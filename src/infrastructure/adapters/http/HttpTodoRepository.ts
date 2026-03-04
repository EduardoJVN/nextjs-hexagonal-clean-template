import type { ITodoRepository } from "@domain/todo/ITodoRepository";
import { Todo } from "@domain/todo/Todo";
import type { TodoId } from "@domain/todo/TodoId";
import type { IHttpClient } from "../../http/IHttpClient";
import { TodoApiMapper } from "../../acl/todo/TodoApiMapper";
import type { TodoApiResponse } from "../../acl/todo/TodoApiTypes";
import { NotFoundError } from "../../errors/HttpError";

/**
 * Adapter: HttpTodoRepository
 *
 * Implements ITodoRepository by delegating to an external REST API
 * via an IHttpClient. All API-specific translation is handled by
 * TodoApiMapper (the Anti-Corruption Layer).
 *
 * Swap this for InMemoryTodoRepository (or any other adapter) in the
 * composition root — nothing else in the codebase needs to change.
 */
export class HttpTodoRepository implements ITodoRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(): Promise<Todo[]> {
    const dtos = await this.httpClient.get<TodoApiResponse[]>("/todos");
    return dtos.map((dto) => Todo.reconstitute(TodoApiMapper.toDomain(dto)));
  }

  async findById(id: TodoId): Promise<Todo | null> {
    try {
      const dto = await this.httpClient.get<TodoApiResponse>(`/todos/${id.value}`);
      return Todo.reconstitute(TodoApiMapper.toDomain(dto));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      }
      throw error;
    }
  }

  async save(todo: Todo): Promise<void> {
    const payload = TodoApiMapper.toPayload(todo.toPrimitives());
    await this.httpClient.put(`/todos/${todo.id.value}`, payload);
  }

  async delete(id: TodoId): Promise<void> {
    await this.httpClient.delete(`/todos/${id.value}`);
  }
}
