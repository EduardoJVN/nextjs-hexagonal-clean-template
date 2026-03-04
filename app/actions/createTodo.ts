"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTodoUseCase } from "@infrastructure/composition/todo.composition";
import { DomainError } from "@domain/shared/DomainError";
import { type ActionResult, ok, fail } from "@lib/types/action-result";
import { type TodoDTO } from "@application/todo/dtos/TodoDTO";

const CreateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters"),
});

type CreateTodoInput = FormData | { title: string };

export async function createTodoAction(
  input: CreateTodoInput,
): Promise<ActionResult<TodoDTO>> {
  try {
    const rawTitle =
      input instanceof FormData
        ? (input.get("title") ?? "")
        : input.title;

    const parsed = CreateTodoSchema.safeParse({ title: rawTitle });
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message);
    }

    const dto = await createTodoUseCase.execute({ title: parsed.data.title });
    revalidatePath("/");
    return ok(dto);
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message);
    }
    throw error;
  }
}
