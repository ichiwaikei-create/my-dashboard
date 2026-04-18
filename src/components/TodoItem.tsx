import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (lineIndex: number, title: string) => void;
  disabled: boolean;
}

export function TodoItem({ todo, onToggle, disabled }: TodoItemProps) {
  return (
    <button
      onClick={() => onToggle(todo.lineIndex, todo.title)}
      disabled={disabled}
      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-lg transition-colors active:bg-slate-100 dark:active:bg-slate-700 disabled:opacity-50 ${
        todo.done ? "opacity-60" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
          todo.done
            ? "bg-green-500 border-green-500 text-white"
            : "border-slate-300 dark:border-slate-600"
        }`}
      >
        {todo.done && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span
        className={`text-sm leading-relaxed ${
          todo.done
            ? "line-through text-slate-400 dark:text-slate-500"
            : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {todo.title}
      </span>
    </button>
  );
}
