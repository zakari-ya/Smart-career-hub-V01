import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number) {
  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

export function formatRelativeDate(date: string) {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  const absDiffHours = Math.round(Math.abs(diff) / 36e5);

  if (absDiffHours < 24) {
    return diff >= 0 ? `in ${absDiffHours || 1}h` : `${absDiffHours || 1}h ago`;
  }

  const absDiffDays = Math.round(Math.abs(diff) / 864e5);
  return diff >= 0 ? `in ${absDiffDays}d` : `${absDiffDays}d ago`;
}
