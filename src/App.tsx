import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TodoList } from "./components/TodoList";
import { DailyPlan } from "./components/DailyPlan";
import { DailyReportForm } from "./components/DailyReportForm";
import { Settings } from "./components/Settings";
import { useSettings } from "./hooks/useSettings";
import { useGitHubData } from "./hooks/useGitHubData";
import { useGitHubReport } from "./hooks/useGitHubReport";
import { updateFile } from "./lib/github-api";
import { createEmptyPlan } from "./lib/plan-writer";
import { getTodayString } from "./lib/date-utils";

type Tab = "plan" | "todo" | "report" | "settings";

function App() {
  const { settings, saveSettings, isConfigured } = useSettings();
  const { todoFile, dailyPlan, isLoading, error, isOffline, isSyncing, toggleTodo, refresh } =
    useGitHubData(settings, isConfigured);
  const { report, isSyncing: reportSyncing, saveReport } = useGitHubReport(settings, isConfigured);

  const [tab, setTab] = useState<Tab>(isConfigured ? "plan" : "settings");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const handleCreatePlan = async () => {
    setIsCreatingPlan(true);
    try {
      const today = getTodayString();
      const content = createEmptyPlan(today);
      await updateFile(settings, `plans/daily/${today}.md`, content, "", `📅 プラン作成: ${today}`);
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  useEffect(() => {
    if (!isConfigured) setTab("settings");
  }, [isConfigured]);

  const [visibleError, setVisibleError] = useState<string | null>(null);
  useEffect(() => {
    if (error) {
      setVisibleError(error);
      const timer = setTimeout(() => setVisibleError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-slate-900">
      <Header isSyncing={isSyncing} isOffline={isOffline} />

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400 animate-pulse">読み込み中...</div>
        </div>
      )}

      {visibleError && (
        <div className="absolute top-14 left-4 right-4 z-20 bg-red-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {visibleError}
        </div>
      )}

      {!isLoading && (
        <>
          {tab === "plan" && <DailyPlan plan={dailyPlan} onRefresh={refresh} onCreatePlan={handleCreatePlan} isCreating={isCreatingPlan} />}
          {tab === "todo" && (
            <TodoList
              todoFile={todoFile}
              onToggle={toggleTodo}
              isOffline={isOffline}
              isSyncing={isSyncing}
              onRefresh={refresh}
            />
          )}
          {tab === "report" && (
            <DailyReportForm
              existing={report}
              isSyncing={reportSyncing}
              onSave={saveReport}
            />
          )}
          {tab === "settings" && <Settings settings={settings} onSave={saveSettings} />}
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex safe-bottom">
        <TabButton
          active={tab === "plan"}
          onClick={() => setTab("plan")}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          label="プラン"
        />
        <TabButton
          active={tab === "todo"}
          onClick={() => setTab("todo")}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="TODO"
        />
        <TabButton
          active={tab === "report"}
          onClick={() => setTab("report")}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          }
          label="日報"
          badge={!report}
        />
        <TabButton
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="設定"
        />
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-slate-400 dark:text-slate-500"
      }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default App;
