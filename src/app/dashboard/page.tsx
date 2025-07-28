"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState, useMemo } from "react"
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import { useUserProgress } from "../../hooks/useUserProgress"
import { useGreatPersonByOffset, useTomorrowHint } from "../../hooks/useGreatPeople"
import CountdownTimer from "../../components/countdown/CountdownTimer"
import { DailyFlipCard } from "../../components/animations/FlipAnimation"
import NewPersonEffect from "../../components/animations/NewPersonEffect"
import CompactCalendar from "../../components/calendar/CompactCalendar"
import HistoricalPersonModal from "../../components/modals/HistoricalPersonModal"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 自動リフレッシュの状態管理
  const [lastRefreshDate, setLastRefreshDate] = useState<string>("")
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [isNewDay, setIsNewDay] = useState<boolean>(false)
  const [showNewPersonEffect, setShowNewPersonEffect] = useState<boolean>(false)
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState<boolean>(false)
  
  // 進捗データとフックを取得
  const { progress, loading: progressLoading, error: progressError, recordProgress } = useUserProgress()
  
  // 相対日付で偉人データを取得（refreshKeyで強制再取得）
  const { person: yesterdaysPerson, loading: yesterdayLoading } = useGreatPersonByOffset(-1)
  const { person: todaysPerson, loading: todayLoading, error: todayError } = useGreatPersonByOffset(0)
  const { hint: tomorrowHint, category: tomorrowCategory, loading: hintLoading } = useTomorrowHint()

  // 0時の自動リフレッシュ処理
  const handleMidnightRefresh = useCallback(() => {
    const today = new Date().toDateString()
    
    // 日付が変わった場合の処理
    if (lastRefreshDate !== today) {
      setLastRefreshDate(today)
      setRefreshKey(prev => prev + 1)
      setIsNewDay(true) // フリップアニメーション発動
      
      // ローカルストレージに最後の更新日を記録
      localStorage.setItem('ijin-calendar-last-refresh', today)
      
      // 新しい偉人登場エフェクトを表示（フリップアニメーション後）
      setTimeout(() => {
        setShowNewPersonEffect(true)
      }, 800) // フリップアニメーション完了後に表示
    }
  }, [lastRefreshDate])

  // フリップアニメーション完了時の処理
  const handleFlipComplete = useCallback(() => {
    setIsNewDay(false)
  }, [])

  // 新しい偉人エフェクト完了時の処理
  const handleNewPersonEffectComplete = useCallback(() => {
    setShowNewPersonEffect(false)
  }, [])

  // カレンダー展開切り替え
  const toggleCalendar = useCallback(() => {
    setIsCalendarExpanded(prev => !prev)
  }, [])

  // カレンダー日付選択処理
  const handleCalendarDateSelect = useCallback((date: string) => {
    setSelectedCalendarDate(date)
    setIsHistoricalModalOpen(true)
  }, [])

  // 昨日の偉人を振り返る処理
  const handleYesterdayReview = useCallback(() => {
    if (yesterdaysPerson) {
      // 昨日の日付を計算
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]
      
      setSelectedCalendarDate(yesterdayDate)
      setIsHistoricalModalOpen(true)
    }
  }, [yesterdaysPerson])

  // 過去の偉人モーダルを閉じる
  const handleCloseHistoricalModal = useCallback(() => {
    setIsHistoricalModalOpen(false)
    setSelectedCalendarDate(null)
  }, [])
  
  // 偉人を閲覧済みにする関数
  const handleMarkAsViewed = async () => {
    if (todaysPerson && progress) {
      if (!progress.viewedPeopleIds.includes(todaysPerson.id)) {
        const success = await recordProgress(todaysPerson.id)
        if (success) {
          alert('今日の偉人を閲覧済みに記録しました！')
        } else {
          alert('記録に失敗しました。もう一度お試しください。')
        }
      }
    }
  }

  // 今日の日付を日本語形式で取得（メモ化で最適化）
  const getTodayString = useMemo(() => {
    const today = new Date()
    return today.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    })
  }, []) // 日付は日付が変わるまで不変

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.push("/auth/signin")
  }, [session, status, router])

  // 初回ロード時にローカルストレージから最後の更新日を取得
  useEffect(() => {
    const storedDate = localStorage.getItem('ijin-calendar-last-refresh')
    const today = new Date().toDateString()
    
    if (storedDate) {
      setLastRefreshDate(storedDate)
      
      // 日付が変わっている場合は自動リフレッシュ
      if (storedDate !== today) {
        handleMidnightRefresh()
      }
    } else {
      // 初回訪問の場合
      setLastRefreshDate(today)
      localStorage.setItem('ijin-calendar-last-refresh', today)
    }
  }, []) // 依存配列を空にして初回のみ実行

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
              <div className="space-y-4 lg:space-y-6">
          
          {/* コンパクトヘッダー - レスポンシブレイアウト */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 lg:px-6 py-3 rounded-lg border border-indigo-100">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-2 lg:space-y-0">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                {getTodayString}
              </h1>
              <p className="text-xs lg:text-sm text-indigo-700 line-clamp-2 lg:line-clamp-1">
                おかえりなさい、{session.user?.name}さん。今日も偉人たちの知恵に触れて、素晴らしい一日を過ごしましょう。
              </p>
            </div>
          </div>

          {/* 偉人情報エリア - 5カラムレイアウト（レスポンシブ対応） */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[320px]">
            {/* 昨日の偉人 - 1カラム */}
            <div className="bg-white rounded-lg shadow p-3 flex flex-col min-h-[280px] lg:min-h-0">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex-shrink-0">昨日の偉人</h3>
              <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
                {yesterdayLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                ) : yesterdaysPerson ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white text-lg font-bold">
                        {yesterdaysPerson.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-center mb-2 text-sm truncate w-full">{yesterdaysPerson.name}</h4>
                    <p className="text-xs text-gray-600 text-center mb-2 line-clamp-2">{yesterdaysPerson.profession}</p>
                    <button 
                      onClick={handleYesterdayReview}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded px-2 py-1"
                    >
                      振り返る
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">データなし</p>
                )}
              </div>
            </div>

            {/* 今日の偉人 - 3カラム（メイン・説明文フル） */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow p-4 min-h-[280px]">
              <DailyFlipCard 
                isNewDay={isNewDay}
                onFlipComplete={handleFlipComplete}
                className="h-full"
              >
                <div className="h-full">
                  <h3 className="text-lg font-bold text-center mb-3 flex-shrink-0">🎭 今日の偉人</h3>
                  
                  {todayLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">読み込み中...</p>
                    </div>
                  ) : todayError ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-red-500 text-2xl">⚠️</span>
                      </div>
                      <p className="text-red-600">データの読み込みに失敗しました</p>
                    </div>
                  ) : todaysPerson ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
                      {/* 偉人基本情報 */}
                      <div className="flex flex-col items-center justify-center lg:justify-start">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white text-lg lg:text-xl font-bold">
                            {todaysPerson.name.charAt(0)}
                          </span>
                        </div>
                        <h4 className="text-base lg:text-lg font-bold text-center truncate w-full">{todaysPerson.name}</h4>
                        <p className="text-xs lg:text-sm text-indigo-600 font-medium text-center line-clamp-2">
                          {todaysPerson.profession}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          ({todaysPerson.birthYear}年 - {todaysPerson.deathYear || '現在'}年)
                        </p>
                      </div>
                      
                      {/* 名言と説明（2カラム分・フル表示） */}
                      <div className="lg:col-span-2 flex flex-col justify-start space-y-3 overflow-hidden">
                        <blockquote className="text-xs lg:text-sm italic text-gray-700 p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500 flex-shrink-0">
                          <span className="line-clamp-3">"{todaysPerson.quote}"</span>
                        </blockquote>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs lg:text-sm text-gray-600 leading-relaxed line-clamp-6 lg:line-clamp-8">
                            {todaysPerson.description}
                          </p>
                        </div>
                        <div className="pt-2 flex-shrink-0">
                          {progress && !progress.viewedPeopleIds.includes(todaysPerson.id) ? (
                            <button
                              onClick={handleMarkAsViewed}
                              className="bg-indigo-600 text-white px-4 py-2 text-xs lg:text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              この偉人と出会う ✨
                            </button>
                          ) : progress?.viewedPeopleIds.includes(todaysPerson.id) ? (
                            <div className="text-green-600 text-xs lg:text-sm font-medium flex items-center">
                              <span className="mr-2">✅</span>
                              出会い済み
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📚</span>
                      </div>
                      <p className="text-gray-600">今日の偉人データがありません</p>
                    </div>
                  )}
                </div>
              </DailyFlipCard>
            </div>

            {/* 明日の偉人・進捗 - 1カラム */}
            <div className="space-y-3 lg:space-y-4 min-h-[280px] lg:min-h-0">
              {/* 明日の偉人 */}
              <div className="bg-white rounded-lg shadow p-3 flex flex-col">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex-shrink-0">明日の偉人</h3>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {hintLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                  ) : (
                    <>
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                        <span className="text-white text-base lg:text-lg font-bold">?</span>
                      </div>
                      <h4 className="font-semibold text-center mb-3 text-sm">お楽しみに！</h4>
                      <div className="text-xs text-center">
                        <CountdownTimer onMidnight={handleMidnightRefresh} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* 進捗情報 */}
              <div className="bg-white rounded-lg shadow p-3 flex flex-col">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex-shrink-0">あなたの進捗</h3>
                <div className="flex-1 flex flex-col justify-center text-center">
                  {progressLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  ) : progress ? (
                    <>
                      <div className="text-2xl lg:text-3xl font-bold text-indigo-600 mb-2">{progress.totalViewed}</div>
                      <div className="text-xs text-gray-600">今月出会った偉人</div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">データなし</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 月間カレンダーエリア（レスポンシブ対応・常時展開） */}
          <div className="bg-gray-50 border-t mt-6">
            <div className="bg-white rounded-lg shadow p-3 lg:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">📅 月間カレンダー</h3>
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100" aria-label="前の月">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-sm lg:text-base">2025年7月</span>
                  <button className="p-1 rounded hover:bg-gray-100" aria-label="次の月">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* レスポンシブカレンダー表示 */}
              <div className="h-32 sm:h-40 lg:h-48 overflow-hidden">
                <CompactCalendar
                  onDateSelect={handleCalendarDateSelect}
                  markedDates={
                    // 進捗データから閲覧済み日付を生成（最適化版）
                    progress?.viewedPeopleIds && progress.viewedPeopleIds.length > 0 
                      ? progress.viewedPeopleIds.slice(0, 31).map((_, index) => {
                          const date = new Date()
                          date.setDate(date.getDate() - index)
                          return date.toISOString().split('T')[0]
                        })
                      : []
                  }
                  className="w-full h-full text-xs lg:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      
      {/* 新しい偉人登場エフェクト */}
      <NewPersonEffect
        isTriggered={showNewPersonEffect}
        personName={todaysPerson?.name}
        onEffectComplete={handleNewPersonEffectComplete}
      />

      {/* 過去の偉人表示モーダル */}
      <HistoricalPersonModal
        isOpen={isHistoricalModalOpen}
        date={selectedCalendarDate}
        onClose={handleCloseHistoricalModal}
      />
    </DashboardLayout>
  )
} 