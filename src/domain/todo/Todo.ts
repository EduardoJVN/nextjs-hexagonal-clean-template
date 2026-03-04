import { AggregateRoot } from "../shared/AggregateRoot";
import { TodoId } from "./TodoId";
import { TodoTitle } from "./TodoTitle";
import { TodoAlreadyCompletedError } from "./TodoErrors";

interface TodoPrimitives {
  id: string;
  title: string;
  completedAt: Date | null;
  createdAt: Date;
}

export class Todo extends AggregateRoot<TodoId> {
  private _title: TodoTitle;
  private _completedAt: Date | null;
  private readonly _createdAt: Date;

  private constructor(
    id: TodoId,
    title: TodoTitle,
    completedAt: Date | null,
    createdAt: Date,
  ) {
    super(id);
    this._title = title;
    this._completedAt = completedAt;
    this._createdAt = createdAt;
  }

  public static create(title: string): Todo {
    const id = TodoId.create();
    const todoTitle = TodoTitle.create(title);
    const createdAt = new Date();
    return new Todo(id, todoTitle, null, createdAt);
  }

  public static reconstitute(primitives: TodoPrimitives): Todo {
    const id = TodoId.fromString(primitives.id);
    const title = TodoTitle.create(primitives.title);
    return new Todo(id, title, primitives.completedAt, primitives.createdAt);
  }

  get title(): TodoTitle {
    return this._title;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isCompleted(): boolean {
    return this._completedAt !== null;
  }

  public complete(): void {
    if (this.isCompleted) {
      throw new TodoAlreadyCompletedError();
    }
    this._completedAt = new Date();
  }

  public toPrimitives(): TodoPrimitives {
    return {
      id: this.id.value,
      title: this._title.value,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
    };
  }
}
