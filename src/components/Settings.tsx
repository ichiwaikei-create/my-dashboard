import { useState } from "react";
import type { AppSettings } from "../types";
import { testConnection } from "../lib/github-api";

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function Settings({ settings, onSave }: SettingsProps) {
  const [token, setToken] = useState(settings.githubToken);
  const [owner, setOwner] = useState(settings.repoOwner);
  const [repo, setRepo] = useState(settings.repoName);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleSave = () => {
    onSave({ githubToken: token.trim(), repoOwner: owner.trim(), repoName: repo.trim() });
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection({
        githubToken: token.trim(),
        repoOwner: owner.trim(),
        repoName: repo.trim(),
      });
      setTestResult(ok ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4 py-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">設定</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_xxxx..."
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            Fine-grained PAT (Contents: Read and write)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            リポジトリオーナー
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="username"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            リポジトリ名
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="secretary-data"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium active:bg-blue-700"
          >
            保存
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !token || !owner || !repo}
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-sm font-medium active:bg-slate-300 dark:active:bg-slate-600 disabled:opacity-50"
          >
            {testing ? "テスト中..." : "接続テスト"}
          </button>
        </div>

        {testResult === "success" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-sm text-green-700 dark:text-green-300">
            接続成功
          </div>
        )}
        {testResult === "error" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-300">
            接続失敗。トークンとリポジトリ名を確認してください。
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-slate-400 dark:text-slate-500 space-y-2">
        <h3 className="font-medium text-slate-500 dark:text-slate-400">セットアップ手順</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>GitHub で .secretary をprivateリポジトリとしてpush</li>
          <li>Settings → Developer settings → Fine-grained PAT を作成</li>
          <li>Contents: Read and write 権限を付与</li>
          <li>上のフォームに入力して保存</li>
        </ol>
      </div>
    </div>
  );
}
