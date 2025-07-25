import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSSクラス名を安全にマージするユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付を「YYYY-MM-DD」形式の文字列に変換
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 今日の日付を「YYYY-MM-DD」形式で取得
 */
export function getTodayString(): string {
  return formatDateToString(new Date())
}

/**
 * 文字列とシードから簡単なハッシュ値を生成
 */
export function simpleHash(str: string, seed: number = 0): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
} 