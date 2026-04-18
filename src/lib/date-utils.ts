const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[date.getDay()];
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateJapanese(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_NAMES[date.getDay()];
  return `${month}月${day}日 (${dayOfWeek})`;
}

export function isCurrentTimeBlock(timeStr: string): boolean {
  const match = timeStr.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
  if (!match) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
  const endMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
