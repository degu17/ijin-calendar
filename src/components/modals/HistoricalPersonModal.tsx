"use client"

import { useState, useEffect } from "react"
import type { GreatPerson } from "../../types"

interface HistoricalPersonModalProps {
  isOpen: boolean
  date: string | null // YYYY-MM-DD
  onClose: () => void
}

export default function HistoricalPersonModal({
  isOpen,
  date,
  onClose
}: HistoricalPersonModalProps) {
  const [person, setPerson] = useState<GreatPerson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 指定日の偉人データを取得
  const fetchPersonByDate = async (dateString: string) => {
    try {
      setLoading(true)
      setError(null)

      // YYYY-MM-DD を MM-DD に変換
      const [year, month, day] = dateString.split('-')
      const formattedDate = `${month}-${day}`

      const response = await fetch(`/api/great-people/${formattedDate}`)
      const result = await response.json()

      if (result.success) {
        setPerson(result.data)
      } else {
        setError('その日の偉人データが見つかりませんでした')
        setPerson(null)
      }
    } catch (err) {
      setError('偉人データの取得に失敗しました')
      setPerson(null)
    } finally {
      setLoading(false)
    }
  }

  // 日付が変更された時にデータを取得
  useEffect(() => {
    if (isOpen && date) {
      fetchPersonByDate(date)
    }
  }, [isOpen, date])

  // モーダルを閉じる時にデータをリセット
  useEffect(() => {
    if (!isOpen) {
      setPerson(null)
      setError(null)
    }
  }, [isOpen])

  // 日付を日本語形式で表示
  const formatJapaneseDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto">
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  📅 その日の偉人
                </h2>
                {date && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatJapaneseDate(date)}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="閉じる"
              >
                <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">偉人データを読み込み中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-3xl">📚</span>
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  閉じる
                </button>
              </div>
            ) : person ? (
              <div className="space-y-6">
                {/* 偉人アバター */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <span className="text-white text-3xl font-bold">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {person.name}
                  </h3>
                  <p className="text-lg text-indigo-600 font-medium">
                    {person.profession} ({person.birthYear}年 - {person.deathYear || '現在'}年)
                  </p>
                </div>

                {/* 名言 */}
                <blockquote className="text-lg text-gray-700 italic font-medium text-center bg-gray-50 rounded-lg px-6 py-4 border-l-4 border-indigo-500">
                  "{person.quote}"
                </blockquote>

                {/* 説明 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">プロフィール</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {person.description}
                  </p>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    閉じる
                  </button>
                  <button
                    onClick={() => {
                      // 今日の偉人として設定する機能（実装予定）
                      alert('今日の偉人として設定する機能は実装予定です')
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    詳しく学ぶ
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
} 