import { DomainError } from "../shared/DomainError";

export class TodoNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Todo with id "${id}" was not found`);
  }
}

export class TodoTitleEmptyError extends DomainError {
  constructor() {
    super("Todo title cannot be empty or whitespace");
  }
}

export class TodoTitleTooLongError extends DomainError {
  constructor(maxLength: number = 255) {
    super(`Todo title cannot exceed ${maxLength} characters`);
  }
}

export class TodoAlreadyCompletedError extends DomainError {
  constructor() {
    super("Todo is already completed");
  }
}
