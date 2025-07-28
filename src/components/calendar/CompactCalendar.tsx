"use client"

import { useState, useEffect } from "react"
// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

interface CompactCalendarProps {
  onDateSelect?: (date: string) => void
  markedDates?: string[] // YYYY-MM-DD形式
  className?: string
}

interface CalendarDay {
  date: string // YYYY-MM-DD
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isMarked: boolean
  hasGreatPerson: boolean
}

export default function CompactCalendar({ 
  onDateSelect, 
  markedDates = [], 
  className = "" 
}: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // 日本語の月名
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ]

  // 日本語の曜日名
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"]

  // カレンダーの日付データを生成
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    // 月の最初と最後の日
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 週の開始日を取得（日曜日 = 0）
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    // カレンダーの日付配列を生成（6週間分）
    const days: CalendarDay[] = []
    const currentIterDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateString = currentIterDate.toISOString().split('T')[0]
      const dayNumber = currentIterDate.getDate()
      const isCurrentMonth = currentIterDate.getMonth() === month

      days.push({
        date: dateString,
        day: dayNumber,
        isCurrentMonth,
        isToday: dateString === todayString,
        isMarked: markedDates.includes(dateString),
        hasGreatPerson: isCurrentMonth && hasGreatPersonForDate(dateString)
      })

      currentIterDate.setDate(currentIterDate.getDate() + 1)
    }

    return days
  }

  // 指定日に偉人データがあるかチェック（簡易実装）
  const hasGreatPersonForDate = (dateString: string): boolean => {
    // 実際の偉人データをチェックする処理
    // 現在は3人の偉人データがあるので、3日に1回偉人がいると仮定
    const date = new Date(dateString)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    return dayOfYear % 3 === 1 // 3日に1回偉人データがある
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 日付がクリックされた時の処理
  const handleDateClick = (day: CalendarDay) => {
    if (day.isCurrentMonth && day.hasGreatPerson) {
      onDateSelect?.(day.date)
    }
  }

  // 現在の月のカレンダーデータを更新
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentDate))
  }, [currentDate, markedDates])

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <button
          onClick={() => changeMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="前の月"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <h3 className="text-sm font-medium text-gray-900">
          {currentDate.getFullYear()}年{monthNames[currentDate.getMonth()]}
        </h3>
        
        <button
          onClick={() => changeMonth('next')}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="次の月"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((dayName, index) => (
          <div
            key={dayName}
            className={`py-1 text-xs text-center font-medium ${
              index === 0 ? 'text-red-600' : 
              index === 6 ? 'text-blue-600' : 
              'text-gray-600'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <button
            key={`${day.date}-${index}`}
            onClick={() => handleDateClick(day)}
            disabled={!day.isCurrentMonth || !day.hasGreatPerson}
            className={`
              relative h-8 text-xs flex items-center justify-center
              transition-colors duration-200
              ${!day.isCurrentMonth 
                ? 'text-gray-300 cursor-default' 
                : day.hasGreatPerson
                  ? 'text-gray-900 hover:bg-indigo-50 cursor-pointer'
                  : 'text-gray-400 cursor-default'
              }
              ${day.isToday ? 'font-bold' : ''}
            `}
          >
            {/* 日付 */}
            <span className={`
              ${day.isToday 
                ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                : ''
              }
            `}>
              {day.day}
            </span>

            {/* 偉人データがある日のマーク */}
            {day.hasGreatPerson && day.isCurrentMonth && (
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  day.isMarked ? 'bg-green-500' : 'bg-indigo-500'
                }`} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span>偉人</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>閲覧済み</span>
          </div>
        </div>
      </div>
    </div>
  )
} 