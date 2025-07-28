import { prisma } from "./prisma"
import { UserProgress } from "../hooks/useUserProgress"

/**
 * ユーザーの進捗データを取得
 * @param userId ユーザーID
 * @returns ユーザーの進捗情報
 */
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        viewedGreatPeople: true,
        currentProgress: true,
        lastViewedDate: true,
        todaysPersonId: true,
        createdAt: true,
      }
    })

    if (!user) {
      return null
    }

    // 日付関連の計算
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const thisWeekStart = getWeekStart(now)
    const thisMonthStart = getMonthStart(now)

    // 今週・今月の閲覧数計算（実際の実装では閲覧履歴テーブルが必要）
    // 現在は簡易実装として固定値を返す
    const thisWeekCount = calculateViewsInPeriod(user.viewedGreatPeople, thisWeekStart)
    const thisMonthCount = calculateViewsInPeriod(user.viewedGreatPeople, thisMonthStart)

    // 進捗率計算（100人を基準）
    const totalPeople = 100 // 将来的に動的に取得
    const progressPercentage = Math.round((user.currentProgress / totalPeople) * 100)

    return {
      userId: user.id,
      totalViewed: user.currentProgress,
      totalPeople,
      progressPercentage,
      thisWeekCount,
      thisMonthCount,
      lastViewedDate: user.lastViewedDate,
      todaysPersonId: user.todaysPersonId,
      viewedPeopleIds: user.viewedGreatPeople,
    }

  } catch (error) {
    console.error("進捗データ取得エラー:", error)
    throw new Error("進捗データの取得に失敗しました")
  }
}

/**
 * 偉人閲覧記録の更新
 * @param userId ユーザーID
 * @param personId 偉人ID
 * @param date 閲覧日（YYYY-MM-DD形式）
 * @returns 更新成功かどうか
 */
export async function recordPersonView(
  userId: string, 
  personId: string, 
  date: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        viewedGreatPeople: true,
        currentProgress: true,
      }
    })

    if (!user) {
      throw new Error("ユーザーが見つかりません")
    }

    // 重複チェック
    if (user.viewedGreatPeople.includes(personId)) {
      // 既に閲覧済みの場合は何もしない
      return true
    }

    // 新しい偉人を閲覧リストに追加
    const updatedViewedPeople = [...user.viewedGreatPeople, personId]
    const newProgress = updatedViewedPeople.length

    // データベース更新
    await prisma.user.update({
      where: { id: userId },
      data: {
        viewedGreatPeople: updatedViewedPeople,
        currentProgress: newProgress,
        lastViewedDate: date,
        todaysPersonId: personId,
        updatedAt: new Date(),
      }
    })

    return true

  } catch (error) {
    console.error("閲覧記録更新エラー:", error)
    throw new Error("閲覧記録の更新に失敗しました")
  }
}

/**
 * 進捗リセット（100人完了後）
 * @param userId ユーザーID
 * @returns リセット成功かどうか
 */
export async function resetUserProgress(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        viewedGreatPeople: [],
        currentProgress: 0,
        lastViewedDate: null,
        todaysPersonId: null,
        updatedAt: new Date(),
      }
    })

    return true

  } catch (error) {
    console.error("進捗リセットエラー:", error)
    throw new Error("進捗リセットに失敗しました")
  }
}

/**
 * 今日の偉人IDを設定/取得
 * @param userId ユーザーID
 * @param personId 今日の偉人ID
 * @returns 設定成功かどうか
 */
export async function setTodaysPerson(userId: string, personId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        todaysPersonId: personId,
        lastViewedDate: today,
        updatedAt: new Date(),
      }
    })

    return true

  } catch (error) {
    console.error("今日の偉人設定エラー:", error)
    throw new Error("今日の偉人の設定に失敗しました")
  }
}

/**
 * 指定期間内の閲覧数を計算（簡易実装）
 * 実際の実装では閲覧履歴テーブルが必要
 */
function calculateViewsInPeriod(viewedPeople: string[], periodStart: Date): number {
  // 現在は簡易実装として、閲覧数の一部を返す
  // 実際の実装では閲覧日時を記録するテーブルが必要
  const totalViewed = viewedPeople.length
  
  // 簡易計算: 総閲覧数の20%を今週、50%を今月として計算
  const now = new Date()
  const daysSinceStart = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceStart <= 7) {
    // 今週の分
    return Math.min(totalViewed, Math.floor(totalViewed * 0.3))
  } else {
    // 今月の分
    return Math.min(totalViewed, Math.floor(totalViewed * 0.6))
  }
}

/**
 * 週の開始日（月曜日）を取得
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 月曜日を週の開始とする
  return new Date(d.setDate(diff))
}

/**
 * 月の開始日を取得
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * 偉人閲覧の妥当性チェック
 * @param personId 偉人ID
 * @returns 妥当な偉人IDかどうか
 */
export function isValidPersonId(personId: string): boolean {
  // 基本的な形式チェック
  if (!personId || typeof personId !== 'string') {
    return false
  }

  // 長さチェック
  if (personId.length < 3 || personId.length > 50) {
    return false
  }

  // 英数字とハイフンのみ許可
  const validPattern = /^[a-zA-Z0-9-]+$/
  return validPattern.test(personId)
} 