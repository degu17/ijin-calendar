"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "../../components/dashboard/DashboardLayout"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/auth/signin") // Not authenticated
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ウェルカムセクション */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              おかえりなさい、{session.user?.name}さん
            </h1>
            <p className="text-gray-600">
              今日も偉人たちの知恵に触れて、素晴らしい一日を過ごしましょう。
            </p>
          </div>
        </div>

        {/* メインコンテンツグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 今日の偉人エリア */}
          <div className="lg:col-span-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  今日の偉人
                </h2>
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    偉人データを読み込み中...
                  </h3>
                  <p className="text-gray-600">
                    今日紹介する偉人の情報を準備しています。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 進捗エリア */}
          <div className="space-y-6">
            {/* 進捗統計 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  あなたの進捗
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">閲覧した偉人</span>
                      <span className="font-medium">0 / 365</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">0</div>
                      <div className="text-xs text-gray-600">今週</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-xs text-gray-600">今月</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  クイックアクション
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900">カレンダーを見る</div>
                    <div className="text-xs text-gray-500">全ての偉人を確認</div>
                  </button>
                  <button className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900">ランダム偉人</div>
                    <div className="text-xs text-gray-500">偶然の出会いを楽しむ</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* カレンダーエリア（プレビュー） */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              今月のカレンダー
            </h2>
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                カレンダーコンポーネントは次のステップで実装予定です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 