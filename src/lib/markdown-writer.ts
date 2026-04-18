export function toggleTodoLine(rawContent: string, lineIndex: number): string {
  const lines = rawContent.split("\n");
  const line = lines[lineIndex];
  if (!line) return rawContent;

  if (line.includes("- [ ]")) {
    lines[lineIndex] = line.replace("- [ ]", "- [x]");
  } else if (line.includes("- [x]")) {
    lines[lineIndex] = line.replace("- [x]", "- [ ]");
  }

  return lines.join("\n");
}

export function moveTodoToCompleted(
  rawContent: string,
  lineIndex: number
): string {
  const lines = rawContent.split("\n");
  const line = lines[lineIndex];
  if (!line) return rawContent;

  // Mark as done
  const doneLine = line.includes("- [ ]")
    ? line.replace("- [ ]", "- [x]")
    : line;

  // Remove from current position
  lines.splice(lineIndex, 1);

  // Find the "## 完了" section
  let completedSectionIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "## 完了") {
      completedSectionIndex = i;
      break;
    }
  }

  if (completedSectionIndex === -1) return lines.join("\n");

  // Find the end of the completed section (next ## or end of file)
  let insertIndex = completedSectionIndex + 1;
  for (let i = completedSectionIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ") && !lines[i].startsWith("## 完了")) {
      break;
    }
    if (lines[i].match(/^- \[/)) {
      insertIndex = i + 1;
    }
  }

  // If no items found after header, insert right after header
  if (insertIndex === completedSectionIndex + 1) {
    // Skip the placeholder line like "- [x] (完了したらここに移動)"
    for (let i = completedSectionIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith("## ")) break;
      if (lines[i].match(/^- \[x\]/)) {
        insertIndex = i + 1;
      }
    }
  }

  lines.splice(insertIndex, 0, doneLine);
  return lines.join("\n");
}

export function moveTodoFromCompleted(
  rawContent: string,
  lineIndex: number,
  targetCategory: string
): string {
  const lines = rawContent.split("\n");
  const line = lines[lineIndex];
  if (!line) return rawContent;

  // Mark as undone
  const undoneLine = line.replace("- [x]", "- [ ]");

  // Remove from completed section
  lines.splice(lineIndex, 1);

  // Find the target category section
  let targetSectionIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === `## ${targetCategory}`) {
      targetSectionIndex = i;
      break;
    }
  }

  // Default to "通常" if target not found
  if (targetSectionIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === "## 通常") {
        targetSectionIndex = i;
        break;
      }
    }
  }

  if (targetSectionIndex === -1) return lines.join("\n");

  // Find insertion point (after last item in section, or right after header)
  let insertIndex = targetSectionIndex + 1;
  for (let i = targetSectionIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) break;
    if (lines[i].match(/^- \[/)) {
      insertIndex = i + 1;
    }
  }

  lines.splice(insertIndex, 0, undoneLine);
  return lines.join("\n");
}
