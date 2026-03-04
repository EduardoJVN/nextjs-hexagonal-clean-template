import { ValueObject } from "../shared/ValueObject";
import { TodoTitleEmptyError, TodoTitleTooLongError } from "./TodoErrors";

const MAX_TITLE_LENGTH = 255;

interface TodoTitleProps {
  value: string;
}

export class TodoTitle extends ValueObject<TodoTitleProps> {
  private constructor(props: TodoTitleProps) {
    super(props);
  }

  public static create(title: string): TodoTitle {
    if (!title || title.trim().length === 0) {
      throw new TodoTitleEmptyError();
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new TodoTitleTooLongError(MAX_TITLE_LENGTH);
    }
    return new TodoTitle({ value: title });
  }

  get value(): string {
    return this.props.value;
  }
}
