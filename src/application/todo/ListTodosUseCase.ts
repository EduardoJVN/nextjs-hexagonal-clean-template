import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { UseCase } from "../shared/UseCase";
import { TodoDTO, todoToDTO } from "./dtos/TodoDTO";

type ListTodosInput = Record<string, never>;

export class ListTodosUseCase implements UseCase<ListTodosInput, TodoDTO[]> {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(_input: ListTodosInput): Promise<TodoDTO[]> {
    const todos = await this.repository.findAll();
    return todos.map(todoToDTO);
  }
}
