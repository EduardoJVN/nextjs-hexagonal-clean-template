/**
 * Composition Root — Todo
 *
 * This is the ONLY place where infrastructure adapters are wired together.
 * Swap pattern: if API_BASE_URL is configured → HttpTodoRepository (real HTTP calls).
 *               Otherwise                     → InMemoryTodoRepository (local, stateful stub).
 *
 * Nothing outside this file needs to know which adapter is active.
 * All use-cases depend only on the ITodoRepository port.
 */
import { serverEnv } from "@lib/config/env.server";
import { InMemoryTodoRepository } from "../adapters/in-memory/InMemoryTodoRepository";
import { HttpTodoRepository } from "../adapters/http/HttpTodoRepository";
import { FetchHttpClient } from "../http/FetchHttpClient";
import type { ITodoRepository } from "@domain/todo/ITodoRepository";
import { CreateTodoUseCase } from "@application/todo/CreateTodoUseCase";
import { ListTodosUseCase } from "@application/todo/ListTodosUseCase";
import { CompleteTodoUseCase } from "@application/todo/CompleteTodoUseCase";

const todoRepository: ITodoRepository = serverEnv.API_BASE_URL
  ? new HttpTodoRepository(new FetchHttpClient(serverEnv.API_BASE_URL))
  : new InMemoryTodoRepository();

export const createTodoUseCase = new CreateTodoUseCase(todoRepository);
export const listTodosUseCase = new ListTodosUseCase(todoRepository);
export const completeTodoUseCase = new CompleteTodoUseCase(todoRepository);
