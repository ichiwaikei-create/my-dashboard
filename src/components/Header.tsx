import { getTodayString, formatDateJapanese } from "../lib/date-utils";

interface HeaderProps {
  isSyncing: boolean;
  isOffline: boolean;
}

export function Header({ isSyncing, isOffline }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-800 text-white px-4 py-3 flex items-center justify-between safe-top">
      <h1 className="text-lg font-bold">{formatDateJapanese(getTodayString())}</h1>
      <div className="flex items-center gap-2 text-sm">
        {isOffline && (
          <span className="bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded text-xs">
            オフライン
          </span>
        )}
        {isSyncing && (
          <span className="text-slate-300 animate-pulse text-xs">同期中...</span>
        )}
      </div>
    </header>
  );
}
