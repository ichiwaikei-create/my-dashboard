import { getDayOfWeek, isWorkday } from "./date-utils";

export function createEmptyPlan(date: string): string {
  const dow = getDayOfWeek(date);
  const workday = isWorkday(date);
  const dayType = workday ? "勤務日" : "休日";

  if (workday) {
    return `---
date: "${date}"
type: integrated_daily_plan
day_type: "${dayType}"
todo_file: "../../todos/${date}.md"
---

# 統合実行計画 - ${date} (${dow})

## 今日の最重要

-

## 時間ブロック

### 20:00 - 21:00 筋トレ
-

### 21:00 - 21:30 最重要タスク
-

### 21:30 - 22:30 メイン作業
-

### 22:30 - 23:00 DM返信・翌日準備
-

## 最低ライン

- 筋トレ + メイン作業1つ完了
`;
  } else {
    return `---
date: "${date}"
type: integrated_daily_plan
day_type: "${dayType}"
todo_file: "../../todos/${date}.md"
---

# 統合実行計画 - ${date} (${dow})

## 今日の最重要

-

## 時間ブロック

### 09:00 - 10:00 筋トレ
-

### 10:30 - 12:00 深い思考ブロック
-

### 13:00 - 15:00 コンテンツ制作
-

### 15:30 - 17:00 投稿作成・素材準備
-

### 17:00 - 18:00 事務・DM返信・振り返り
-

## 最低ライン

- 筋トレ + 深い思考ブロック1つ + 投稿1本
`;
  }
}
