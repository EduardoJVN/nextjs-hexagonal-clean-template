import { describe, it, expect } from "vitest";
import { TodoApiMapper } from "../TodoApiMapper";
import type { TodoApiResponse } from "../TodoApiTypes";

const CREATED_AT = "2024-01-15T10:00:00.000Z";
const COMPLETED_AT = "2024-01-16T12:30:00.000Z";
const TODO_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("TodoApiMapper.toDomain", () => {
  it("maps all fields correctly for a pending (incomplete) todo", () => {
    const dto: TodoApiResponse = {
      todo_id: TODO_ID,
      todo_title: "Read the docs",
      is_done: false,
      created_at: CREATED_AT,
      completed_at: null,
    };

    const primitives = TodoApiMapper.toDomain(dto);

    expect(primitives.id).toBe(TODO_ID);
    expect(primitives.title).toBe("Read the docs");
    expect(primitives.completedAt).toBeNull();
    expect(primitives.createdAt).toEqual(new Date(CREATED_AT));
  });

  it("maps a completed todo — completedAt is a Date when completed_at is provided", () => {
    const dto: TodoApiResponse = {
      todo_id: TODO_ID,
      todo_title: "Write tests",
      is_done: true,
      created_at: CREATED_AT,
      completed_at: COMPLETED_AT,
    };

    const primitives = TodoApiMapper.toDomain(dto);

    expect(primitives.completedAt).toEqual(new Date(COMPLETED_AT));
    expect(primitives.createdAt).toEqual(new Date(CREATED_AT));
  });

  it("handles null completed_at for a pending todo — completedAt stays null", () => {
    const dto: TodoApiResponse = {
      todo_id: TODO_ID,
      todo_title: "Pending task",
      is_done: false,
      created_at: CREATED_AT,
      completed_at: null,
    };

    const primitives = TodoApiMapper.toDomain(dto);

    expect(primitives.completedAt).toBeNull();
  });

  it("falls back to createdAt when is_done=true but completed_at is null", () => {
    const dto: TodoApiResponse = {
      todo_id: TODO_ID,
      todo_title: "Done but no timestamp",
      is_done: true,
      created_at: CREATED_AT,
      completed_at: null,
    };

    const primitives = TodoApiMapper.toDomain(dto);

    // Fallback: completedAt equals createdAt
    expect(primitives.completedAt).toEqual(new Date(CREATED_AT));
  });

  it("produces a Date instance (not a string) for completedAt", () => {
    const dto: TodoApiResponse = {
      todo_id: TODO_ID,
      todo_title: "Verify types",
      is_done: true,
      created_at: CREATED_AT,
      completed_at: COMPLETED_AT,
    };

    const primitives = TodoApiMapper.toDomain(dto);

    expect(primitives.completedAt).toBeInstanceOf(Date);
    expect(primitives.createdAt).toBeInstanceOf(Date);
  });
});

describe("TodoApiMapper.toPayload", () => {
  it("maps a pending (incomplete) todo correctly", () => {
    const primitives = {
      id: TODO_ID,
      title: "Buy groceries",
      completedAt: null,
      createdAt: new Date(CREATED_AT),
    };

    const payload = TodoApiMapper.toPayload(primitives);

    expect(payload.todo_title).toBe("Buy groceries");
    expect(payload.is_done).toBe(false);
    expect(payload.completed_at).toBeNull();
  });

  it("maps a completed todo — is_done true and completed_at as ISO string", () => {
    const completedDate = new Date(COMPLETED_AT);
    const primitives = {
      id: TODO_ID,
      title: "Ship the feature",
      completedAt: completedDate,
      createdAt: new Date(CREATED_AT),
    };

    const payload = TodoApiMapper.toPayload(primitives);

    expect(payload.todo_title).toBe("Ship the feature");
    expect(payload.is_done).toBe(true);
    expect(payload.completed_at).toBe(COMPLETED_AT);
  });

  it("completed_at is an ISO 8601 string when completedAt is a Date", () => {
    const completedDate = new Date(COMPLETED_AT);
    const primitives = {
      id: TODO_ID,
      title: "Check format",
      completedAt: completedDate,
      createdAt: new Date(CREATED_AT),
    };

    const payload = TodoApiMapper.toPayload(primitives);

    // Must be a string, not a Date object
    expect(typeof payload.completed_at).toBe("string");
    expect(payload.completed_at).toBe(completedDate.toISOString());
  });
});
