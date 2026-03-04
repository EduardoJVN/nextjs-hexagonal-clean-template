import { Todo } from "@domain/todo/Todo";

export interface TodoDTO {
  id: string;
  title: string;
  completedAt: Date | null;
  createdAt: Date;
}

export function todoToDTO(todo: Todo): TodoDTO {
  const primitives = todo.toPrimitives();
  return {
    id: primitives.id,
    title: primitives.title,
    completedAt: primitives.completedAt,
    createdAt: primitives.createdAt,
  };
}
