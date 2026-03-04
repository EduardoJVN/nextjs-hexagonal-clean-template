import type { TodoPrimitives } from "@domain/todo/Todo";
import type { TodoApiResponse, TodoApiPayload } from "./TodoApiTypes";

/**
 * Anti-Corruption Layer — TodoApiMapper
 *
 * Translates between the external API's wire format (snake_case, ISO strings)
 * and the domain's primitive representation.
 *
 * NEVER let the external API shape leak into the domain model.
 * All translation concerns live here and only here.
 */
export class TodoApiMapper {
  /**
   * Maps an external API response to domain primitives.
   *
   * - todo_id     → id
   * - todo_title  → title
   * - is_done + completed_at → completedAt (Date | null)
   *   If the item is marked done but the API sent no completed_at,
   *   fall back to created_at as the completion timestamp.
   */
  static toDomain(dto: TodoApiResponse): TodoPrimitives {
    const createdAt = new Date(dto.created_at);

    let completedAt: Date | null = null;
    if (dto.completed_at !== null && dto.completed_at !== undefined) {
      completedAt = new Date(dto.completed_at);
    } else if (dto.is_done) {
      // Fallback: API says done but sent no completed_at — use created_at
      completedAt = createdAt;
    }

    return {
      id: dto.todo_id,
      title: dto.todo_title,
      completedAt,
      createdAt,
    };
  }

  /**
   * Maps domain primitives to the payload expected by the external API.
   *
   * - title        → todo_title
   * - completedAt !== null → is_done: true
   * - completedAt  → completed_at (ISO string or null)
   */
  static toPayload(primitives: TodoPrimitives): TodoApiPayload {
    return {
      todo_title: primitives.title,
      is_done: primitives.completedAt !== null,
      completed_at: primitives.completedAt?.toISOString() ?? null,
    };
  }
}
