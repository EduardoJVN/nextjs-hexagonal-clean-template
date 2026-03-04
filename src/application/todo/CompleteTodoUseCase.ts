import { TodoId } from "@domain/todo/TodoId";
import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { UseCase } from "../shared/UseCase";
import { ApplicationError } from "../shared/ApplicationError";
import { TodoDTO, todoToDTO } from "./dtos/TodoDTO";

interface CompleteTodoInput {
  id: string;
}

export class CompleteTodoUseCase implements UseCase<CompleteTodoInput, TodoDTO> {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(input: CompleteTodoInput): Promise<TodoDTO> {
    const todoId = TodoId.fromString(input.id);
    const todo = await this.repository.findById(todoId);

    if (todo === null) {
      throw new ApplicationError(`Todo with id "${input.id}" not found`);
    }

    // Domain enforces TodoAlreadyCompletedError — let it propagate
    todo.complete();
    await this.repository.save(todo);

    return todoToDTO(todo);
  }
}
