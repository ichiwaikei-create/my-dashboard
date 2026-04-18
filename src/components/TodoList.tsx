import { useState } from "react";
import type { TodoFile, TodoCategory } from "../types";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todoFile: TodoFile | null;
  onToggle: (lineIndex: number, title: string) => void;
  isOffline: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
}

const CATEGORY_ORDER: TodoCategory[] = ["最優先", "通常", "余裕があれば"];

const CATEGORY_STYLES: Record<TodoCategory, string> = {
  "最優先": "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  "通常": "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "余裕があれば": "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  "完了": "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
};

export function TodoList({ todoFile, onToggle, isOffline, isSyncing, onRefresh }: TodoListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  if (!todoFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 p-8">
        <div className="text-center">
          <p className="text-lg">今日のTODOはまだありません</p>
          <button onClick={onRefresh} className="mt-4 text-sm text-blue-500 active:text-blue-700">
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const activeTodos = todoFile.todos.filter((t) => (t.category as string) !== "完了");
  const completedTodos = todoFile.todos.filter((t) => (t.category as string) === "完了" || t.done);

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Day label */}
      {todoFile.dayLabel && (
        <div className="px-4 pt-3 pb-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">{todoFile.dayLabel}</span>
        </div>
      )}

      {/* Active categories */}
      {CATEGORY_ORDER.map((category) => {
        const todos = activeTodos.filter((t) => t.category === category && !t.done);
        if (todos.length === 0) return null;

        return (
          <div key={category} className="px-4 py-2">
            <h3
              className={`text-xs font-bold uppercase tracking-wider pb-1 mb-1 border-b ${CATEGORY_STYLES[category]}`}
            >
              {category}
            </h3>
            {todos.map((todo) => (
              <TodoItem
                key={todo.lineIndex}
                todo={todo}
                onToggle={onToggle}
                disabled={isOffline || isSyncing}
              />
            ))}
          </div>
        );
      })}

      {/* Completed section */}
      {completedTodos.length > 0 && (
        <div className="px-4 py-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider pb-1 mb-1 border-b border-green-200 dark:border-green-800 w-full"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCompleted ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            完了 ({completedTodos.length})
          </button>
          {showCompleted &&
            completedTodos.map((todo) => (
              <TodoItem
                key={todo.lineIndex}
                todo={{ ...todo, done: true }}
                onToggle={onToggle}
                disabled={isOffline || isSyncing}
              />
            ))}
        </div>
      )}

      {/* Memo */}
      {todoFile.memo.length > 0 && (
        <div className="px-4 py-3 mt-2 mx-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">メモ</h3>
          {todoFile.memo.map((m, i) => (
            <p key={i} className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {m}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
