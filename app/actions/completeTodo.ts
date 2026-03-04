"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { completeTodoUseCase } from "@infrastructure/composition/todo.composition";
import { DomainError } from "@domain/shared/DomainError";
import { ApplicationError } from "@application/shared/ApplicationError";
import { type ActionResult, ok, fail } from "@lib/types/action-result";
import { type TodoDTO } from "@application/todo/dtos/TodoDTO";

const CompleteTodoSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
});

export async function completeTodoAction(input: {
  id: string;
}): Promise<ActionResult<TodoDTO>> {
  try {
    const parsed = CompleteTodoSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message);
    }

    const dto = await completeTodoUseCase.execute({ id: parsed.data.id });
    revalidatePath("/");
    return ok(dto);
  } catch (error) {
    if (error instanceof DomainError || error instanceof ApplicationError) {
      return fail(error.message);
    }
    throw error;
  }
}
