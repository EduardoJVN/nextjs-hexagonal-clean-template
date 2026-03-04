import { Todo } from "./Todo";
import { TodoId } from "./TodoId";

export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: TodoId): Promise<Todo | null>;
  save(todo: Todo): Promise<void>;
  delete(id: TodoId): Promise<void>;
}
