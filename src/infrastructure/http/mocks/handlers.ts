/**
 * MSW Request Handlers
 *
 * Defines mock handlers for all Todo API endpoints.
 * Field names match the external API wire format defined in TodoApiTypes.ts
 * (snake_case: todo_id, todo_title, is_done, created_at, completed_at).
 *
 * These handlers are shared between:
 * - Node (Vitest integration tests) via server.ts
 * - Browser (development storybook / dev mode) via browser.ts
 */
import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:3000";

const fakeTodos = [
  {
    todo_id: "todo-1",
    todo_title: "Buy groceries",
    is_done: false,
    created_at: "2024-01-01T10:00:00.000Z",
    completed_at: null,
  },
  {
    todo_id: "todo-2",
    todo_title: "Write unit tests",
    is_done: true,
    created_at: "2024-01-02T09:00:00.000Z",
    completed_at: "2024-01-03T14:00:00.000Z",
  },
];

export const handlers = [
  /** GET /todos — returns array of 2 fake TodoApiResponse objects */
  http.get(`${BASE_URL}/todos`, () => {
    return HttpResponse.json(fakeTodos);
  }),

  /** GET /todos/:id — returns single TodoApiResponse or 404 */
  http.get(`${BASE_URL}/todos/:id`, ({ params }) => {
    const todo = fakeTodos.find((t) => t.todo_id === params.id);
    if (!todo) {
      return HttpResponse.json({ message: "Todo not found" }, { status: 404 });
    }
    return HttpResponse.json(todo);
  }),

  /** PUT /todos/:id — returns 200 with updated todo */
  http.put(`${BASE_URL}/todos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as {
      todo_title?: string;
      is_done?: boolean;
      completed_at?: string | null;
    };
    const existing = fakeTodos.find((t) => t.todo_id === params.id);
    if (!existing) {
      return HttpResponse.json({ message: "Todo not found" }, { status: 404 });
    }
    const updated = { ...existing, ...body };
    return HttpResponse.json(updated);
  }),

  /** DELETE /todos/:id — returns 204 No Content */
  http.delete(`${BASE_URL}/todos/:id`, ({ params }) => {
    const exists = fakeTodos.some((t) => t.todo_id === params.id);
    if (!exists) {
      return HttpResponse.json({ message: "Todo not found" }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
