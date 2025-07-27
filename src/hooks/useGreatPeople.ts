"use client"

import { useState, useEffect } from "react"

export interface GreatPerson {
  id: string
  name: string
  birthYear: number
  deathYear: number
  profession: string
  description: string
  quote: string
  imageUrl: string
}

interface UseGreatPeopleReturn {
  greatPeople: GreatPerson[]
  loading: boolean
  error: string | null
  getPersonByDate: (date: string) => GreatPerson | null
  refetch: () => void
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
    fetchGreatPeople()
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

interface UseGreatPersonByDateReturn {
  person: GreatPerson | null
  loading: boolean
  error: string | null
}

export function useGreatPersonByDate(date: string): UseGreatPersonByDateReturn {
  const [person, setPerson] = useState<GreatPerson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date) return

    const fetchPersonByDate = async () => {
      try {
        setLoading(true)
        setError(null)

        // とりあえず全データから最初の偉人を取得（デモ用）
        const response = await fetch("/api/great-people")
        const result = await response.json()

        if (result.success && result.data.length > 0) {
          setPerson(result.data[0])
        } else {
          setPerson(null)
          if (response.status !== 404) {
            setError(result.message || "偉人データの取得に失敗しました")
          }
        }
      } catch (err) {
        setError("ネットワークエラーが発生しました")
        setPerson(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonByDate()
  }, [date])

  return {
    person,
    loading,
    error,
  }
} 