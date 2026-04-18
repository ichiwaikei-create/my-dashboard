import type { DailyPlan as DailyPlanType } from "../types";
import { isCurrentTimeBlock } from "../lib/date-utils";

interface DailyPlanProps {
  plan: DailyPlanType | null;
  onRefresh: () => void;
  onCreatePlan?: () => Promise<void>;
  isCreating?: boolean;
}

export function DailyPlan({ plan, onRefresh, onCreatePlan, isCreating }: DailyPlanProps) {
  if (!plan) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 p-8">
        <div className="text-center space-y-3">
          <p className="text-lg">今日のプランはありません</p>
          {onCreatePlan && (
            <button
              onClick={onCreatePlan}
              disabled={isCreating}
              className="block mx-auto bg-blue-600 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isCreating ? "作成中..." : "今日のプランを作成"}
            </button>
          )}
          <button onClick={onRefresh} className="block mx-auto text-sm text-slate-400 active:text-blue-700">
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Day type badge */}
      {plan.dayType && (
        <div className="px-4 pt-3 pb-1">
          <span className={`text-xs px-2 py-0.5 rounded ${
            plan.dayType === "休日"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}>
            {plan.dayType}
          </span>
        </div>
      )}

      {/* Top priorities */}
      {plan.topPriorities.length > 0 && (
        <div className="px-4 py-3">
          <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
            最重要
          </h3>
          <div className="space-y-2">
            {plan.topPriorities.map((p, i) => (
              <div
                key={i}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2"
              >
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time blocks */}
      {plan.timeBlocks.length > 0 && (
        <div className="px-4 py-2">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            タイムライン
          </h3>
          <div className="space-y-1">
            {plan.timeBlocks.map((block, i) => {
              const isCurrent = isCurrentTimeBlock(block.time);
              return (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 border-l-4 ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-mono ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-400 dark:text-slate-500"
                    }`}>
                      {block.time}
                    </span>
                    <span className={`text-sm font-medium ${
                      isCurrent
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-slate-700 dark:text-slate-300"
                    }`}>
                      {block.label}
                    </span>
                  </div>
                  {block.items.length > 0 && (
                    <ul className="mt-1 ml-1 space-y-0.5">
                      {block.items.map((item, j) => (
                        <li key={j} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          · {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimum line */}
      {plan.minimumLine.length > 0 && (
        <div className="px-4 py-3 mt-2 mx-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">最低ライン</h3>
          <ul className="space-y-0.5">
            {plan.minimumLine.map((item, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
