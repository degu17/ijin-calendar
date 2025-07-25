// 偉人データの型定義
export interface GreatPerson {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number | null; // 存命の場合null
  profession: string;
  description: string;
  quote: string;
  imageUrl?: string;
}

// 偉人データコレクションの型定義
export interface GreatPeopleData {
  version: string;
  dataHash: string;
  lastUpdated: string;
  people: GreatPerson[];
}

// ユーザー関連の型定義
export interface UserProgress {
  viewedGreatPeople: string[];
  currentProgress: number;
  lastViewedDate?: string;
  todaysPersonId?: string;
}

// API レスポンスの型定義
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 認証関連の型定義
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
} 