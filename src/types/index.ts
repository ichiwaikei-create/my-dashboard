export type TodoCategory = "最優先" | "通常" | "余裕があれば" | "完了";

export interface Todo {
  title: string;
  done: boolean;
  category: TodoCategory;
  lineIndex: number;
}

export interface TodoFile {
  date: string;
  dayLabel: string;
  todos: Todo[];
  memo: string[];
  rawContent: string;
  sha: string;
}

export interface TimeBlock {
  time: string;
  label: string;
  items: string[];
}

export interface DailyPlan {
  date: string;
  dayType: string;
  topPriorities: string[];
  timeBlocks: TimeBlock[];
  minimumLine: string[];
}

export interface AppSettings {
  githubToken: string;
  repoOwner: string;
  repoName: string;
}

export interface DailyReport {
  date: string;
  moodScore: number;
  healthScore: number;
  doneToday: string;
  wentWell: string;
  difficulties: string;
  insights: string;
  tomorrowTop: string;
  tomorrowTasks: string[];
  memo: string;
  sha?: string;
}
