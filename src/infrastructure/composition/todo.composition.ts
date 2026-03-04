// Replace InMemoryTodoRepository with a real adapter when adding infrastructure
// (e.g., DrizzleTodoRepository, PrismaTodoRepository) — swap only here, nothing else changes.
import { InMemoryTodoRepository } from "../adapters/in-memory/InMemoryTodoRepository";
import { CreateTodoUseCase } from "@application/todo/CreateTodoUseCase";
import { ListTodosUseCase } from "@application/todo/ListTodosUseCase";
import { CompleteTodoUseCase } from "@application/todo/CompleteTodoUseCase";

const todoRepository = new InMemoryTodoRepository();

export const createTodoUseCase = new CreateTodoUseCase(todoRepository);
export const listTodosUseCase = new ListTodosUseCase(todoRepository);
export const completeTodoUseCase = new CompleteTodoUseCase(todoRepository);
