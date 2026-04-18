import type { Todo, TodoFile, TodoCategory, DailyPlan, TimeBlock } from "../types";

const TODO_CATEGORIES: TodoCategory[] = ["最優先", "通常", "余裕があれば", "完了"];

export function parseTodoFile(content: string, sha: string): TodoFile {
  const lines = content.split("\n");
  const todos: Todo[] = [];
  const memo: string[] = [];
  let currentCategory: TodoCategory | null = null;
  let inMemo = false;
  let date = "";
  let dayLabel = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Parse frontmatter date
    const dateMatch = line.match(/^date:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (dateMatch) {
      date = dateMatch[1];
      continue;
    }

    // Parse day label from heading (e.g., "# 2026-04-18 (土・勤務日)")
    const headingMatch = line.match(/^#\s+\d{4}-\d{2}-\d{2}\s+\((.+)\)/);
    if (headingMatch) {
      dayLabel = headingMatch[1];
      continue;
    }

    // Check for section headers
    if (line.startsWith("## ")) {
      const sectionName = line.replace("## ", "").trim();
      if (TODO_CATEGORIES.includes(sectionName as TodoCategory)) {
        currentCategory = sectionName as TodoCategory;
        inMemo = false;
        continue;
      }
      if (sectionName === "メモ・振り返り") {
        inMemo = true;
        currentCategory = null;
        continue;
      }
    }

    // Parse TODO items
    if (currentCategory) {
      const todoMatch = line.match(/^- \[([ x])\]\s+(.+)/);
      if (todoMatch) {
        todos.push({
          done: todoMatch[1] === "x",
          title: todoMatch[2].trim(),
          category: currentCategory,
          lineIndex: i,
        });
      }
    }

    // Parse memo lines
    if (inMemo) {
      const memoMatch = line.match(/^- (.+)/);
      if (memoMatch) {
        memo.push(memoMatch[1].trim());
      }
    }
  }

  return { date, dayLabel, todos, memo, rawContent: content, sha };
}

export function parseDailyPlan(content: string): DailyPlan {
  const lines = content.split("\n");
  let date = "";
  let dayType = "";
  const topPriorities: string[] = [];
  const timeBlocks: TimeBlock[] = [];
  const minimumLine: string[] = [];

  let section: "none" | "priorities" | "timeblock" | "minimum" = "none";
  let currentBlock: TimeBlock | null = null;

  for (const line of lines) {
    // Parse frontmatter
    const dateMatch = line.match(/^date:\s*"(\d{4}-\d{2}-\d{2})"/);
    if (dateMatch) {
      date = dateMatch[1];
      continue;
    }
    const dayTypeMatch = line.match(/^day_type:\s*"(.+)"/);
    if (dayTypeMatch) {
      dayType = dayTypeMatch[1];
      continue;
    }

    // Section headers
    if (line.match(/^## 今日の最重要/)) {
      section = "priorities";
      if (currentBlock) timeBlocks.push(currentBlock);
      currentBlock = null;
      continue;
    }
    if (line.match(/^## 時間ブロック/)) {
      section = "timeblock";
      continue;
    }
    if (line.match(/^## 最低ライン/)) {
      section = "minimum";
      if (currentBlock) timeBlocks.push(currentBlock);
      currentBlock = null;
      continue;
    }
    if (line.match(/^## /) && !line.match(/^### /)) {
      if (currentBlock) timeBlocks.push(currentBlock);
      currentBlock = null;
      section = "none";
      continue;
    }

    // Time block headers (### HH:MM - HH:MM label)
    const blockMatch = line.match(/^### (\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\s+(.+)/);
    if (blockMatch && (section === "timeblock" || section === "none")) {
      if (currentBlock) timeBlocks.push(currentBlock);
      currentBlock = { time: blockMatch[1], label: blockMatch[2], items: [] };
      section = "timeblock";
      continue;
    }

    // List items
    const itemMatch = line.match(/^- (.+)/);
    if (itemMatch) {
      const text = itemMatch[1].trim();
      if (section === "priorities") {
        topPriorities.push(text);
      } else if (section === "minimum") {
        minimumLine.push(text);
      } else if (section === "timeblock" && currentBlock) {
        currentBlock.items.push(text);
      }
    }
  }

  if (currentBlock) timeBlocks.push(currentBlock);

  return { date, dayType, topPriorities, timeBlocks, minimumLine };
}
