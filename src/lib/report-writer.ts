import type { DailyReport } from "../types";
import { getDayOfWeek } from "./date-utils";

export function formatReport(report: DailyReport): string {
  const dow = getDayOfWeek(report.date);
  const tasks = report.tomorrowTasks
    .filter((t) => t.trim())
    .map((t) => `- [ ] ${t}`)
    .join("\n") || "- [ ] ";

  return `---
date: "${report.date}"
type: daily_review
todo_file: "../../todos/${report.date}.md"
inbox_file: "../../inbox/${report.date}.md"
---

# Daily Review - ${report.date} (${dow})

- 気分スコア: ${report.moodScore}
- 体調スコア: ${report.healthScore}

## 今日やったこと

${report.doneToday.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[-・]\s*/, "")}`).join("\n") || "- "}

## うまくいったこと

${report.wentWell.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[-・]\s*/, "")}`).join("\n") || "- "}

## 詰まったこと・感情

${report.difficulties.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[-・]\s*/, "")}`).join("\n") || "- "}

## 気づき・学び

${report.insights.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[-・]\s*/, "")}`).join("\n") || "- "}

## 家計・お金メモ

-

## 体調・生活メモ

-

## 明日の最重要1つ

- ${report.tomorrowTop || ""}

## 明日の3タスク

${tasks}

## 雑メモ

${report.memo ? report.memo.split("\n").filter(Boolean).map((l) => `- ${l.replace(/^[-・]\s*/, "")}`).join("\n") : "- "}
`;
}

export function parseReport(content: string, sha: string): DailyReport {
  const lines = content.split("\n");
  let date = "";
  let moodScore = 3;
  let healthScore = 3;
  const sections: Record<string, string[]> = {};
  let currentSection = "";

  for (const line of lines) {
    const dateMatch = line.match(/^date:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (dateMatch) { date = dateMatch[1]; continue; }

    const moodMatch = line.match(/^- 気分スコア:\s*(\d)/);
    if (moodMatch) { moodScore = parseInt(moodMatch[1]); continue; }

    const healthMatch = line.match(/^- 体調スコア:\s*(\d)/);
    if (healthMatch) { healthScore = parseInt(healthMatch[1]); continue; }

    if (line.startsWith("## ")) {
      currentSection = line.replace("## ", "").trim();
      sections[currentSection] = [];
      continue;
    }

    if (currentSection && line.match(/^- /)) {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(line.replace(/^- (\[ \] )?/, "").trim());
    }
  }

  const get = (key: string) => (sections[key] || []).filter(Boolean).join("\n");

  const tomorrowTasks = (sections["明日の3タスク"] || [])
    .map((t) => t.replace(/^\[[ x]\] /, "").trim())
    .filter(Boolean);

  return {
    date,
    moodScore,
    healthScore,
    doneToday: get("今日やったこと"),
    wentWell: get("うまくいったこと"),
    difficulties: get("詰まったこと・感情"),
    insights: get("気づき・学び"),
    tomorrowTop: (sections["明日の最重要1つ"] || [])[0] || "",
    tomorrowTasks: tomorrowTasks.length ? tomorrowTasks : ["", "", ""],
    memo: get("雑メモ"),
    sha,
  };
}
