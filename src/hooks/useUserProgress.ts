"use client"

import { useState, useEffect } from "react"

export interface UserProgress {
  userId: string
  totalViewed: number
  totalPeople: number
  progressPercentage: number
  thisWeekCount: number
  thisMonthCount: number
  lastViewedDate: string | null
  todaysPersonId: string | null
  viewedPeopleIds: string[]
}

interface UseUserProgressReturn {
  progress: UserProgress | null
  loading: boolean
  error: string | null
  refetch: () => void
  recordProgress: (personId: string) => Promise<boolean>
}

export function useUserProgress(): UseUserProgressReturn {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/progress")
      const result = await response.json()

      if (result.success) {
        setProgress(result.data)
      } else {
        setError(result.message || "進捗データの取得に失敗しました")
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/user/progress", {
          signal: abortController.signal
        })
        const result = await response.json()

        if (result.success) {
          setProgress(result.data)
        } else {
          setError(result.message || "進捗データの取得に失敗しました")
        }
      } catch (err: any) {
        // AbortErrorは無視
        if (err.name !== 'AbortError') {
          setError("ネットワークエラーが発生しました")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    // クリーンアップ関数でリクエストをキャンセル
    return () => {
      abortController.abort()
    }
  }, [])

  const recordProgress = async (personId: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          personId,
          date: new Date().toISOString().split('T')[0]
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 進捗データを再取得して更新
        await fetchProgress()
        return true
      } else {
        setError(result.message || "進捗の記録に失敗しました")
        return false
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました")
      return false
    }
  }

  const refetch = () => {
    fetchProgress()
  }

  return {
    progress,
    loading,
    error,
    refetch,
    recordProgress,
  }
} 