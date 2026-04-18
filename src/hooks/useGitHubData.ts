import { useState, useEffect, useCallback } from "react";
import type { AppSettings, TodoFile, DailyPlan } from "../types";
import { fetchFile, updateFile, ConflictError } from "../lib/github-api";
import { parseTodoFile, parseDailyPlan } from "../lib/markdown-parser";
import { toggleTodoLine, moveTodoToCompleted } from "../lib/markdown-writer";
import { getTodayString } from "../lib/date-utils";

const CACHE_KEY_TODO = "dashboard-cache-todo";
const CACHE_KEY_PLAN = "dashboard-cache-plan";

interface UseGitHubDataResult {
  todoFile: TodoFile | null;
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  isSyncing: boolean;
  toggleTodo: (lineIndex: number, title: string) => void;
  refresh: () => void;
}

export function useGitHubData(settings: AppSettings, isConfigured: boolean): UseGitHubDataResult {
  const [todoFile, setTodoFile] = useState<TodoFile | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadFromCache = useCallback(() => {
    const cachedTodo = localStorage.getItem(CACHE_KEY_TODO);
    const cachedPlan = localStorage.getItem(CACHE_KEY_PLAN);
    if (cachedTodo) {
      try {
        setTodoFile(JSON.parse(cachedTodo));
      } catch { /* ignore */ }
    }
    if (cachedPlan) {
      try {
        setDailyPlan(JSON.parse(cachedPlan));
      } catch { /* ignore */ }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isConfigured) return;
    setIsLoading(true);
    setError(null);

    const today = getTodayString();

    try {
      const [todoResult, planResult] = await Promise.allSettled([
        fetchFile(settings, `todos/${today}.md`),
        fetchFile(settings, `plans/daily/${today}.md`),
      ]);

      if (todoResult.status === "fulfilled" && todoResult.value) {
        const parsed = parseTodoFile(todoResult.value.content, todoResult.value.sha);
        setTodoFile(parsed);
        localStorage.setItem(CACHE_KEY_TODO, JSON.stringify(parsed));
      } else if (todoResult.status === "fulfilled" && !todoResult.value) {
        setTodoFile(null);
        localStorage.removeItem(CACHE_KEY_TODO);
      } else if (todoResult.status === "rejected") {
        throw todoResult.reason;
      }

      if (planResult.status === "fulfilled" && planResult.value) {
        const parsed = parseDailyPlan(planResult.value.content);
        setDailyPlan(parsed);
        localStorage.setItem(CACHE_KEY_PLAN, JSON.stringify(parsed));
      } else if (planResult.status === "fulfilled" && !planResult.value) {
        setDailyPlan(null);
        localStorage.removeItem(CACHE_KEY_PLAN);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      loadFromCache();
    } finally {
      setIsLoading(false);
    }
  }, [settings, isConfigured, loadFromCache]);

  useEffect(() => {
    if (isConfigured && !isOffline) {
      fetchData();
    } else if (isOffline) {
      loadFromCache();
    }
  }, [isConfigured, isOffline, fetchData, loadFromCache]);

  const toggleTodo = useCallback(
    async (lineIndex: number, title: string) => {
      if (!todoFile || isOffline) return;

      const todo = todoFile.todos.find((t) => t.lineIndex === lineIndex);
      if (!todo) return;

      const wasDone = todo.done;

      // Optimistic update
      const updatedTodos = todoFile.todos.map((t) =>
        t.lineIndex === lineIndex ? { ...t, done: !t.done } : t
      );
      const optimisticFile = { ...todoFile, todos: updatedTodos };
      setTodoFile(optimisticFile);

      setIsSyncing(true);
      try {
        let newContent: string;
        if (!wasDone) {
          // Checking off -> move to completed section
          newContent = moveTodoToCompleted(todoFile.rawContent, lineIndex);
        } else {
          // Unchecking -> just toggle in place
          newContent = toggleTodoLine(todoFile.rawContent, lineIndex);
        }

        const message = wasDone
          ? `↩️ タスク戻し: ${title}`
          : `✅ タスク完了: ${title}`;

        const result = await updateFile(
          settings,
          `todos/${getTodayString()}.md`,
          newContent,
          todoFile.sha,
          message
        );

        // Re-parse the updated content with new SHA
        const reParsed = parseTodoFile(newContent, result.sha);
        setTodoFile(reParsed);
        localStorage.setItem(CACHE_KEY_TODO, JSON.stringify(reParsed));
      } catch (err) {
        if (err instanceof ConflictError) {
          setError("データが外部で更新されました。再読み込みします...");
          await fetchData();
        } else {
          // Rollback
          setTodoFile(todoFile);
          setError("同期に失敗しました");
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [todoFile, isOffline, settings, fetchData]
  );

  return {
    todoFile,
    dailyPlan,
    isLoading,
    error,
    isOffline,
    isSyncing,
    toggleTodo,
    refresh: fetchData,
  };
}
