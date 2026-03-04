/**
 * Anti-Corruption Layer — Todo API Types
 *
 * These types represent the external API's wire format.
 * They are intentionally separate from the domain model — the ACL mapper
 * is responsible for translating between these two worlds.
 */

/** Shape of the external API response — may differ from the domain model. */
export interface TodoApiResponse {
  todo_id: string;
  todo_title: string;
  is_done: boolean;
  created_at: string; // ISO 8601 string
  completed_at: string | null; // ISO 8601 string or null
}

/** Shape of the payload sent to the external API on create/update. */
export interface TodoApiPayload {
  todo_title: string;
  is_done: boolean;
  completed_at: string | null;
}
