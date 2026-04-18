import { useState } from "react";
import type { DailyReport } from "../types";
import { getTodayString } from "../lib/date-utils";

interface Props {
  existing: DailyReport | null;
  isSyncing: boolean;
  onSave: (report: DailyReport) => Promise<void>;
}

const STEPS = ["スコア", "今日", "振り返り", "明日"] as const;

function ScoreButton({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
        selected
          ? "bg-blue-600 text-white"
          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      }`}
    >
      {value}
    </button>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
}

export function DailyReportForm({ existing, isSyncing, onSave }: Props) {
  const today = getTodayString();

  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const [moodScore, setMoodScore] = useState(existing?.moodScore ?? 3);
  const [healthScore, setHealthScore] = useState(existing?.healthScore ?? 3);
  const [doneToday, setDoneToday] = useState(existing?.doneToday ?? "");
  const [wentWell, setWentWell] = useState(existing?.wentWell ?? "");
  const [difficulties, setDifficulties] = useState(existing?.difficulties ?? "");
  const [insights, setInsights] = useState(existing?.insights ?? "");
  const [tomorrowTop, setTomorrowTop] = useState(existing?.tomorrowTop ?? "");
  const [tomorrowTasks, setTomorrowTasks] = useState<string[]>(
    existing?.tomorrowTasks ?? ["", "", ""]
  );
  const [memo, setMemo] = useState(existing?.memo ?? "");

  const handleSubmit = async () => {
    const report: DailyReport = {
      date: today,
      moodScore,
      healthScore,
      doneToday,
      wentWell,
      difficulties,
      insights,
      tomorrowTop,
      tomorrowTasks,
      memo,
      sha: existing?.sha,
    };
    await onSave(report);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">日報を提出しました</p>
        <p className="text-sm text-slate-400 text-center">明日のプランはAIが自動で生成します</p>
        <button
          onClick={() => setSaved(false)}
          className="mt-2 text-sm text-blue-500"
        >
          編集する
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Step indicator */}
      <div className="flex px-4 py-3 gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 text-xs py-1 rounded-full font-medium transition-colors ${
              i === step
                ? "bg-blue-600 text-white"
                : i < step
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {step === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">気分スコア</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <ScoreButton key={v} value={v} selected={moodScore === v} onClick={() => setMoodScore(v)} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">体調スコア</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <ScoreButton key={v} value={v} selected={healthScore === v} onClick={() => setHealthScore(v)} />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <Textarea
            label="今日やったこと"
            value={doneToday}
            onChange={setDoneToday}
            placeholder={"・Instagram投稿を1本制作した\n・DM返信を3件した"}
            rows={8}
          />
        )}

        {step === 2 && (
          <>
            <Textarea label="うまくいったこと" value={wentWell} onChange={setWentWell} placeholder="・" rows={4} />
            <Textarea label="詰まったこと・感情" value={difficulties} onChange={setDifficulties} placeholder="・" rows={4} />
            <Textarea label="気づき・学び" value={insights} onChange={setInsights} placeholder="・" rows={4} />
            <Textarea label="雑メモ" value={memo} onChange={setMemo} placeholder="・" rows={3} />
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">明日の最重要1つ</label>
              <input
                type="text"
                value={tomorrowTop}
                onChange={(e) => setTomorrowTop(e.target.value)}
                placeholder="明日絶対やること"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">明日の3タスク</label>
              <div className="space-y-2">
                {tomorrowTasks.map((t, i) => (
                  <input
                    key={i}
                    type="text"
                    value={t}
                    onChange={(e) => {
                      const next = [...tomorrowTasks];
                      next[i] = e.target.value;
                      setTomorrowTasks(next);
                    }}
                    placeholder={`タスク${i + 1}`}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 flex gap-2 border-t border-slate-200 dark:border-slate-700">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            戻る
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white"
          >
            次へ
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSyncing}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white disabled:opacity-50"
          >
            {isSyncing ? "送信中..." : "日報を提出"}
          </button>
        )}
      </div>
    </div>
  );
}
