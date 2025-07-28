"use client"

import { useState, useEffect } from "react"
import type { GreatPerson } from "../types"

interface UseGreatPeopleReturn {
  greatPeople: GreatPerson[]
  loading: boolean
  error: string | null
  getPersonByDate: (date: string) => GreatPerson | null
  refetch: () => void
}

interface UseGreatPersonByDateReturn {
  person: GreatPerson | null
  loading: boolean
  error: string | null
}

interface UseGreatPersonByOffsetReturn {
  person: GreatPerson | null
  loading: boolean
  error: string | null
  hint?: string
  isPreview?: boolean
}

interface UseTomorrowHintReturn {
  hint: string | null
  category: string | null
  loading: boolean
  error: string | null
}

export function useGreatPeople(): UseGreatPeopleReturn {
  const [greatPeople, setGreatPeople] = useState<GreatPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGreatPeople = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/great-people")
      const result = await response.json()

      if (result.success) {
        setGreatPeople(result.data)
      } else {
        setError(result.message || "偉人データの取得に失敗しました")
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

        const response = await fetch("/api/great-people", {
          signal: abortController.signal
        })
        const result = await response.json()

        if (result.success) {
          setGreatPeople(result.data)
        } else {
          setError(result.message || "偉人データの取得に失敗しました")
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

  const getPersonByDate = (date: string): GreatPerson | null => {
    // 現在のデータ構造では日付ベースの検索は未実装
    // とりあえず最初の偉人を返す（デモ用）
    return greatPeople[0] || null
  }

  const refetch = () => {
    fetchGreatPeople()
  }

  return {
    greatPeople,
    loading,
    error,
    getPersonByDate,
    refetch,
  }
}

export function useGreatPersonByDate(date: string): UseGreatPersonByDateReturn {
  const [person, setPerson] = useState<GreatPerson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date) return

    const abortController = new AbortController()

    const fetchPersonByDate = async () => {
      try {
        setLoading(true)
        setError(null)

        // 新しい日付ベースAPIを使用
        const dateOnly = date.split('T')[0] // YYYY-MM-DD から MM-DD を抽出
        const [year, month, day] = dateOnly.split('-')
        const formattedDate = `${month}-${day}`

        const response = await fetch(`/api/great-people/${formattedDate}`, {
          signal: abortController.signal
        })
        const result = await response.json()

        if (result.success) {
          setPerson(result.data)
        } else {
          setPerson(null)
          if (response.status !== 404) {
            setError(result.message || "偉人データの取得に失敗しました")
          }
        }
      } catch (err: any) {
        // AbortErrorは無視
        if (err.name !== 'AbortError') {
          setError("ネットワークエラーが発生しました")
          setPerson(null)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPersonByDate()
    
    // クリーンアップ関数でリクエストをキャンセル
    return () => {
      abortController.abort()
    }
  }, [date])

  return {
    person,
    loading,
    error,
  }
}

/**
 * 相対日付（昨日=-1、今日=0、明日=1）で偉人データを取得
 */
export function useGreatPersonByOffset(offset: number): UseGreatPersonByOffsetReturn {
  const [person, setPerson] = useState<GreatPerson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | undefined>(undefined)
  const [isPreview, setIsPreview] = useState<boolean>(false)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchPersonByOffset = async () => {
      try {
        setLoading(true)
        setError(null)
        setHint(undefined)
        setIsPreview(false)

        const response = await fetch(`/api/great-people/relative/${offset}`, {
          signal: abortController.signal
        })
        const result = await response.json()

        if (result.success) {
          if (result.data.isPreview) {
            // 明日の偉人（プレビュー）
            setHint(result.data.hint)
            setIsPreview(true)
            setPerson(null)
          } else {
            // 昨日・今日の偉人（完全データ）
            setPerson(result.data)
          }
        } else {
          setPerson(null)
          if (response.status !== 404) {
            setError(result.message || "偉人データの取得に失敗しました")
          }
        }
      } catch (err: any) {
        // AbortErrorは無視
        if (err.name !== 'AbortError') {
          setError("ネットワークエラーが発生しました")
          setPerson(null)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchPersonByOffset()
    
    // クリーンアップ関数でリクエストをキャンセル
    return () => {
      abortController.abort()
    }
  }, [offset])

  return {
    person,
    loading,
    error,
    hint,
    isPreview,
  }
}

/**
 * 明日の偉人のヒントを取得
 */
export function useTomorrowHint(): UseTomorrowHintReturn {
  const [hint, setHint] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchTomorrowHint = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/great-people/relative/1`, {
          signal: abortController.signal
        })
        const result = await response.json()

        if (result.success && result.data.isPreview) {
          setHint(result.data.hint)
          setCategory(result.data.category)
        } else {
          setHint(null)
          setCategory(null)
          if (response.status !== 404) {
            setError(result.message || "ヒントデータの取得に失敗しました")
          }
        }
      } catch (err: any) {
        // AbortErrorは無視
        if (err.name !== 'AbortError') {
          setError("ネットワークエラーが発生しました")
          setHint(null)
          setCategory(null)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchTomorrowHint()
    
    // クリーンアップ関数でリクエストをキャンセル
    return () => {
      abortController.abort()
    }
  }, [])

  return {
    hint,
    category,
    loading,
    error,
  }
} 