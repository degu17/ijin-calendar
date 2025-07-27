"use client"

import { useState } from "react"

interface CalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 月の初日と最終日を取得
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  // カレンダーの開始日（月曜日から始まる）
  const startOfCalendar = new Date(startOfMonth)
  const dayOfWeek = startOfMonth.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfCalendar.setDate(startOfMonth.getDate() - mondayOffset)

  // カレンダーの終了日
  const endOfCalendar = new Date(endOfMonth)
  const endDayOfWeek = endOfMonth.getDay()
  const sundayOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
  endOfCalendar.setDate(endOfMonth.getDate() + sundayOffset)

  // カレンダーの日付配列を生成
  const calendarDays = []
  const currentCalendarDate = new Date(startOfCalendar)
  
  while (currentCalendarDate <= endOfCalendar) {
    calendarDays.push(new Date(currentCalendarDate))
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  // 前月・次月への移動
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 今月に戻る
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  // 日付選択ハンドラ
  const handleDateClick = (date: Date) => {
    onDateSelect?.(date)
  }

  // 日付の表示判定
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const weekdays = ["月", "火", "水", "木", "金", "土", "日"]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50"
          >
            今月
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="p-6">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const isCurrentMonthDate = isCurrentMonth(date)
            const isTodayDate = isToday(date)
            const isSelectedDate = isSelected(date)

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  relative p-2 h-12 text-sm rounded-md transition-colors
                  ${isCurrentMonthDate 
                    ? "text-gray-900 hover:bg-gray-100" 
                    : "text-gray-400 hover:bg-gray-50"
                  }
                  ${isTodayDate 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                    : ""
                  }
                  ${isSelectedDate && !isTodayDate 
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600" 
                    : ""
                  }
                `}
              >
                <span className="relative z-10">
                  {date.getDate()}
                </span>
                
                {/* 偉人データがある日を示すインジケーター（今後実装予定） */}
                {isCurrentMonthDate && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-green-500 rounded-full opacity-75"></div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択された日付の表示 */}
      {selectedDate && (
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            選択中: {selectedDate.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long"
            })}
          </p>
        </div>
      )}
    </div>
  )
} 