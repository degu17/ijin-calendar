"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUserProgress } from "../../../hooks/useUserProgress"
import { useGreatPeople } from "../../../hooks/useGreatPeople"
import DashboardLayout from "../../../components/dashboard/DashboardLayout"

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // データ取得
  const { progress, loading: progressLoading, error: progressError } = useUserProgress()
  const { greatPeople, loading: peopleLoading } = useGreatPeople()

  // 認証チェック
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  // 閲覧済みの偉人リストを取得
  const viewedPeople = greatPeople.filter(person => 
    progress?.viewedPeopleIds.includes(person.id)
  )

  // 未閲覧の偉人リストを取得
  const unviewedPeople = greatPeople.filter(person => 
    !progress?.viewedPeopleIds.includes(person.id)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学習進捗</h1>
          <p className="text-gray-600">
            あなたの学習状況と閲覧済みの偉人を確認できます
          </p>
        </div>

        {progressLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">進捗データを読み込み中...</p>
          </div>
        ) : progressError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full mb-4 flex items-center justify-center">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <p className="text-red-600">進捗データの読み込みに失敗しました</p>
          </div>
        ) : progress ? (
          <>
            {/* 進捗統計 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📚</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          閲覧済み偉人
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {progress.totalViewed} / {progress.totalPeople}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">%</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          完了率
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {progress.progressPercentage}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📅</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          今週
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {progress.thisWeekCount}人
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📊</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          今月
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {progress.thisMonthCount}人
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 進捗バー */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">学習進捗</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">全体の進捗</span>
                      <span className="font-medium">{progress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {progress.lastViewedDate && (
                    <div className="text-sm text-gray-500">
                      最後の学習: {new Date(progress.lastViewedDate).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 閲覧済み偉人一覧 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    閲覧済み偉人 ({viewedPeople.length}人)
                  </h3>
                  
                  {viewedPeople.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {viewedPeople.map((person) => (
                        <div key={person.id} className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {person.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {person.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {person.profession} • {person.birthYear}年-{person.deathYear || '現在'}年
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-green-500 text-sm">✅</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full mb-3 flex items-center justify-center">
                        <span className="text-gray-400 text-xl">📚</span>
                      </div>
                      <p className="text-gray-500 text-sm">まだ偉人を学習していません</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 未閲覧偉人一覧（サンプル） */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    これから学ぶ偉人 ({unviewedPeople.length}人)
                  </h3>
                  
                  {unviewedPeople.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {unviewedPeople.slice(0, 10).map((person) => (
                        <div key={person.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {person.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {person.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {person.profession} • {person.birthYear}年-{person.deathYear || '現在'}年
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-blue-500 text-sm">⏳</span>
                          </div>
                        </div>
                      ))}
                      {unviewedPeople.length > 10 && (
                        <div className="text-center py-2 text-sm text-gray-500">
                          ...他 {unviewedPeople.length - 10}人
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-full mb-3 flex items-center justify-center">
                        <span className="text-green-500 text-xl">🎉</span>
                      </div>
                      <p className="text-green-600 text-sm font-medium">全ての偉人を学習済みです！</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 学習のコツ */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">💡 学習のコツ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">継続的な学習</h4>
                    <p className="text-sm text-gray-600">
                      毎日少しずつでも偉人について学ぶことで、知識が定着しやすくなります。
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">関連性を見つける</h4>
                    <p className="text-sm text-gray-600">
                      偉人同士の時代背景や影響関係を考えると、より深い理解が得られます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <p className="text-gray-600">進捗データがありません</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 