import { Todo } from "@domain/todo/Todo";
import { ITodoRepository } from "@domain/todo/ITodoRepository";
import { UseCase } from "../shared/UseCase";
import { TodoDTO, todoToDTO } from "./dtos/TodoDTO";

interface CreateTodoInput {
  title: string;
}

export class CreateTodoUseCase implements UseCase<CreateTodoInput, TodoDTO> {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(input: CreateTodoInput): Promise<TodoDTO> {
    const todo = Todo.create(input.title);
    await this.repository.save(todo);
    return todoToDTO(todo);
  }
}
