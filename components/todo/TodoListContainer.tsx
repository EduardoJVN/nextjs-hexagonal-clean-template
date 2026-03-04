import { listTodosAction } from "@actions/listTodos";
import { completeTodoAction } from "@actions/completeTodo";
import { TodoList } from "./TodoList";

export async function TodoListContainer() {
  const result = await listTodosAction();
  const todos = result.success ? result.data : [];

  async function handleComplete(id: string) {
    "use server";
    await completeTodoAction({ id });
  }

  return <TodoList todos={todos} onComplete={handleComplete} />;
}
