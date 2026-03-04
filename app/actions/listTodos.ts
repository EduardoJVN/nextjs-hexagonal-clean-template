"use server";

import { listTodosUseCase } from "@infrastructure/composition/todo.composition";
import { type ActionResult, ok } from "@lib/types/action-result";
import { type TodoDTO } from "@application/todo/dtos/TodoDTO";

export async function listTodosAction(): Promise<ActionResult<TodoDTO[]>> {
  const dtos = await listTodosUseCase.execute({});
  return ok(dtos);
}
