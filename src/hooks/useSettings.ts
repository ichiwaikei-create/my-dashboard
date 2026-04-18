import { useState, useCallback } from "react";
import type { AppSettings } from "../types";

const STORAGE_KEY = "dashboard-settings";

function loadSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return { githubToken: "", repoOwner: "", repoName: "" };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setSettingsState(newSettings);
  }, []);

  const isConfigured =
    settings.githubToken !== "" &&
    settings.repoOwner !== "" &&
    settings.repoName !== "";

  return { settings, saveSettings, isConfigured };
}
