"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import DashboardLayout from "../../../components/dashboard/DashboardLayout"
import Calendar from "../../../components/calendar/Calendar"
import { useGreatPersonByDate } from "../../../hooks/useGreatPeople"

export default function CalendarPage() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // 選択された日付の偉人データを取得
  const { person, loading: personLoading, error: personError } = useGreatPersonByDate(
    selectedDate ? selectedDate.toISOString() : ""
  )

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">偉人カレンダー</h1>
          <p className="mt-2 text-gray-600">
            日付をクリックして、その日の偉人について学びましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-2">
            <Calendar 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>

          {/* 選択された日の偉人情報 */}
          <div className="space-y-6">
            {/* 今日の偉人カード */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedDate ? 
                  `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の偉人` : 
                  "日付を選択してください"
                }
              </h3>
              
              {selectedDate ? (
                <div className="py-8">
                  {personLoading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">偉人データを読み込み中...</p>
                    </div>
                  ) : person ? (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {person.name}
                      </h4>
                      <p className="text-sm text-indigo-600 mb-3">
                        {person.profession}
                      </p>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {person.description.substring(0, 120)}
                        {person.description.length > 120 ? "..." : ""}
                      </p>
                      {person.quote && (
                        <blockquote className="text-sm italic text-gray-700 border-l-4 border-indigo-200 pl-4 mt-4">
                          "{person.quote}"
                        </blockquote>
                      )}
                      <div className="mt-4 text-xs text-gray-500">
                        {person.birthYear} - {person.deathYear}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-2xl">📅</span>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        偉人データなし
                      </h4>
                      <p className="text-gray-600 text-sm">
                        この日付の偉人データはまだ登録されていません。
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    カレンダーから日付を選択してください。
                  </p>
                </div>
              )}
            </div>

            {/* 統計情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                閲覧統計
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">今月の閲覧数</span>
                  <span className="font-semibold">0日</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">累計閲覧数</span>
                  <span className="font-semibold">0日</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">達成率</span>
                  <span className="font-semibold">0%</span>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                アクション
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  今日の偉人を見る
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  ランダムな偉人
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  進捗を確認
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 最近見た偉人 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              最近見た偉人
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              まだ偉人を閲覧していません。
              <br />
              カレンダーから日付を選択して、偉人について学んでみましょう。
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 