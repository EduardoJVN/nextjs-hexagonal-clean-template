import { ValueObject } from "../shared/ValueObject";

interface TodoIdProps {
  value: string;
}

export class TodoId extends ValueObject<TodoIdProps> {
  private constructor(props: TodoIdProps) {
    super(props);
  }

  public static create(): TodoId {
    return new TodoId({ value: crypto.randomUUID() });
  }

  public static fromString(id: string): TodoId {
    if (!id || id.trim().length === 0) {
      throw new Error("TodoId cannot be empty");
    }
    return new TodoId({ value: id });
  }

  get value(): string {
    return this.props.value;
  }
}
