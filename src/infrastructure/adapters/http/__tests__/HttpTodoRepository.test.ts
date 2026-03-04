import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpTodoRepository } from "../HttpTodoRepository";
import type { IHttpClient } from "../../../http/IHttpClient";
import { NotFoundError, ApiError } from "../../../errors/HttpError";
import { Todo } from "@domain/todo/Todo";
import { TodoId } from "@domain/todo/TodoId";
import type { TodoApiResponse } from "../../../acl/todo/TodoApiTypes";

/** Hand-rolled MockHttpClient — each method is a vi.fn() spy. */
function makeMockHttpClient(): IHttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

const CREATED_AT = "2024-01-15T10:00:00.000Z";
const COMPLETED_AT = "2024-01-16T12:30:00.000Z";

function makeTodoApiResponse(overrides: Partial<TodoApiResponse> = {}): TodoApiResponse {
  return {
    todo_id: "550e8400-e29b-41d4-a716-446655440000",
    todo_title: "Read the docs",
    is_done: false,
    created_at: CREATED_AT,
    completed_at: null,
    ...overrides,
  };
}

describe("HttpTodoRepository", () => {
  let mockClient: IHttpClient;
  let repository: HttpTodoRepository;

  beforeEach(() => {
    mockClient = makeMockHttpClient();
    repository = new HttpTodoRepository(mockClient);
  });

  describe("findAll", () => {
    it("calls GET /todos and returns reconstituted Todo domain objects", async () => {
      const dtos: TodoApiResponse[] = [
        makeTodoApiResponse({ todo_id: "id-1", todo_title: "First task" }),
        makeTodoApiResponse({ todo_id: "id-2", todo_title: "Second task" }),
      ];
      vi.mocked(mockClient.get).mockResolvedValue(dtos);

      const result = await repository.findAll();

      expect(mockClient.get).toHaveBeenCalledWith("/todos");
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(result[0].toPrimitives().title).toBe("First task");
      expect(result[1].toPrimitives().title).toBe("Second task");
    });

    it("returns an empty array when the API returns an empty list", async () => {
      vi.mocked(mockClient.get).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it("maps completed todos correctly — completedAt is a Date", async () => {
      const dtos: TodoApiResponse[] = [
        makeTodoApiResponse({
          todo_id: "id-1",
          is_done: true,
          completed_at: COMPLETED_AT,
        }),
      ];
      vi.mocked(mockClient.get).mockResolvedValue(dtos);

      const result = await repository.findAll();

      expect(result[0].isCompleted).toBe(true);
      expect(result[0].toPrimitives().completedAt).toEqual(new Date(COMPLETED_AT));
    });
  });

  describe("findById", () => {
    it("calls GET /todos/:id and returns a reconstituted Todo", async () => {
      const dto = makeTodoApiResponse({ todo_id: "id-1", todo_title: "Specific task" });
      vi.mocked(mockClient.get).mockResolvedValue(dto);
      const id = TodoId.fromString("id-1");

      const result = await repository.findById(id);

      expect(mockClient.get).toHaveBeenCalledWith("/todos/id-1");
      expect(result).toBeInstanceOf(Todo);
      expect(result!.toPrimitives().title).toBe("Specific task");
    });

    it("returns null when the httpClient throws NotFoundError", async () => {
      vi.mocked(mockClient.get).mockRejectedValue(new NotFoundError());
      const id = TodoId.fromString("non-existent-id");

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });

    it("re-throws errors that are NOT NotFoundError (e.g. ApiError on 500)", async () => {
      const serverError = new ApiError(500, { message: "Internal Server Error" });
      vi.mocked(mockClient.get).mockRejectedValue(serverError);
      const id = TodoId.fromString("some-id");

      await expect(repository.findById(id)).rejects.toThrow(ApiError);
    });

    it("re-throws UnauthorizedError (not swallowed)", async () => {
      const { UnauthorizedError } = await import("../../../errors/HttpError");
      vi.mocked(mockClient.get).mockRejectedValue(new UnauthorizedError());
      const id = TodoId.fromString("some-id");

      await expect(repository.findById(id)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("save", () => {
    it("calls PUT /todos/:id with the mapped payload", async () => {
      vi.mocked(mockClient.put).mockResolvedValue(undefined);
      const todo = Todo.create("Write more tests");

      await repository.save(todo);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/todos/${todo.id.value}`,
        expect.objectContaining({
          todo_title: "Write more tests",
          is_done: false,
          completed_at: null,
        }),
      );
    });

    it("serializes completedAt as ISO string for a completed todo", async () => {
      vi.mocked(mockClient.put).mockResolvedValue(undefined);
      const todo = Todo.create("Complete me");
      todo.complete();

      await repository.save(todo);

      const callArg = vi.mocked(mockClient.put).mock.calls[0][1] as {
        is_done: boolean;
        completed_at: string | null;
      };
      expect(callArg.is_done).toBe(true);
      expect(typeof callArg.completed_at).toBe("string");
    });
  });

  describe("delete", () => {
    it("calls DELETE /todos/:id", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);
      const id = TodoId.fromString("todo-to-delete");

      await repository.delete(id);

      expect(mockClient.delete).toHaveBeenCalledWith("/todos/todo-to-delete");
    });

    it("returns void on successful delete", async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);
      const id = TodoId.fromString("todo-id");

      const result = await repository.delete(id);

      expect(result).toBeUndefined();
    });
  });
});
