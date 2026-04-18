import { useState, useEffect, useCallback } from "react";
import type { AppSettings, DailyReport } from "../types";
import { fetchFile, updateFile } from "../lib/github-api";
import { parseReport, formatReport } from "../lib/report-writer";
import { getTodayString } from "../lib/date-utils";

const CACHE_KEY = "dashboard-cache-report";

interface UseGitHubReportResult {
  report: DailyReport | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  saveReport: (report: DailyReport) => Promise<void>;
  refresh: () => void;
}

export function useGitHubReport(settings: AppSettings, isConfigured: boolean): UseGitHubReportResult {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayString();

  const fetchReport = useCallback(async () => {
    if (!isConfigured) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFile(settings, `reviews/daily/${today}.md`);
      if (result) {
        const parsed = parseReport(result.content, result.sha);
        setReport(parsed);
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      } else {
        setReport(null);
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得失敗");
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try { setReport(JSON.parse(cached)); } catch { /* ignore */ }
      }
    } finally {
      setIsLoading(false);
    }
  }, [settings, isConfigured, today]);

  useEffect(() => {
    if (isConfigured) fetchReport();
  }, [isConfigured, fetchReport]);

  const saveReport = useCallback(async (data: DailyReport) => {
    setIsSyncing(true);
    setError(null);
    try {
      const content = formatReport(data);
      const result = await updateFile(
        settings,
        `reviews/daily/${today}.md`,
        content,
        data.sha ?? "",
        data.sha ? `📝 日報更新: ${today}` : `📝 日報作成: ${today}`
      );
      const updated = { ...data, sha: result.sha };
      setReport(updated);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失敗");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [settings, today]);

  return { report, isLoading, isSyncing, error, saveReport, refresh: fetchReport };
}
