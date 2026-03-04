/**
 * FetchHttpClient Integration Tests
 *
 * These tests use MSW (Mock Service Worker) to intercept real fetch calls
 * at the Node.js level. No vi.stubGlobal("fetch") here — fetch runs for real
 * and MSW intercepts based on URL patterns, just like in production.
 *
 * The MSW server lifecycle is managed by tests/setup.server.ts (beforeAll /
 * afterEach / afterAll). Individual tests can override handlers per-test
 * using server.use(...).
 *
 * This file belongs to the "server" Vitest project (node environment).
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { FetchHttpClient } from "../FetchHttpClient";
import { NotFoundError, NetworkError, ServiceUnavailableError } from "../../errors/HttpError";
import { server } from "../mocks/server";
import type { TodoApiResponse } from "../../acl/todo/TodoApiTypes";

const BASE_URL = "http://localhost:3000";

describe("FetchHttpClient (integration — MSW)", () => {
  let client: FetchHttpClient;

  beforeEach(() => {
    // Disable retry to keep integration tests fast and deterministic
    client = new FetchHttpClient(BASE_URL, { retry: { attempts: 1 } });
  });

  describe("GET /todos", () => {
    it("returns mapped array of todos from the MSW handler", async () => {
      const result = await client.get<TodoApiResponse[]>("/todos");

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        todo_id: "todo-1",
        todo_title: "Buy groceries",
        is_done: false,
        completed_at: null,
      });
      expect(result[1]).toMatchObject({
        todo_id: "todo-2",
        todo_title: "Write unit tests",
        is_done: true,
      });
    });
  });

  describe("PUT /todos/:id", () => {
    it("sends the correct payload and returns updated todo", async () => {
      const payload = {
        todo_title: "Buy groceries (updated)",
        is_done: true,
        completed_at: "2024-06-01T12:00:00.000Z",
      };

      const result = await client.put<TodoApiResponse>("/todos/todo-1", payload);

      expect(result).toMatchObject({
        todo_id: "todo-1",
        todo_title: "Buy groceries (updated)",
        is_done: true,
        completed_at: "2024-06-01T12:00:00.000Z",
      });
    });
  });

  describe("error mapping", () => {
    it("throws NotFoundError when server returns 404", async () => {
      await expect(client.get("/todos/does-not-exist")).rejects.toThrow(NotFoundError);
    });

    it("throws ServiceUnavailableError when server returns 503 (per-test handler override)", async () => {
      server.use(
        http.get(`${BASE_URL}/todos`, () => {
          return new HttpResponse(null, { status: 503 });
        }),
      );

      await expect(client.get("/todos")).rejects.toThrow(ServiceUnavailableError);
    });

    it("throws NetworkError when the network itself fails (per-test handler override)", async () => {
      server.use(
        http.get(`${BASE_URL}/todos`, () => {
          return HttpResponse.error();
        }),
      );

      await expect(client.get("/todos")).rejects.toThrow(NetworkError);
    });
  });
});
