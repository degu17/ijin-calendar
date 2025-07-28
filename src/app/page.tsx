"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 認証済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ヘッダー */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-gray-900">偉人カレンダー</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ログイン
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <span className="text-6xl mb-4 block">🏛️</span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              毎日偉人の知恵に
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                触れよう
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              365日、毎日違う偉人について学び、彼らの人生と知恵から学習を深めましょう。
              歴史上の偉大な人物たちがあなたの成長をサポートします。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              今すぐ始める
            </Link>
            <Link 
              href="/auth/signin"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              豊富な偉人データ
            </h3>
            <p className="text-gray-600">
              歴史上の偉大な人物たちの生涯、名言、業績を詳しく学べます。
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              進捗管理
            </h3>
            <p className="text-gray-600">
              あなたの学習進捗を可視化し、継続的な学習をサポートします。
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              日々の発見
            </h3>
            <p className="text-gray-600">
              毎日新しい偉人との出会いで、継続的な学習習慣を身につけます。
            </p>
          </div>
        </div>

        {/* 今日の偉人プレビュー */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              今日の偉人
            </h2>
            <p className="text-gray-600">
              今日学べる偉人をプレビューしてみましょう
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">アルベルト・アインシュタイン</h3>
                  <p className="text-indigo-100">理論物理学者</p>
                </div>
              </div>
              <blockquote className="text-lg italic mb-4">
                "想像力は知識よりも重要である。知識には限界があるが、想像力は世界を包み、すべての成長と進歩の源となる。"
              </blockquote>
              <div className="text-sm text-indigo-100">
                <p>1879年 - 1955年</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA セクション */}
        <div className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今日から始めませんか？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            偉人たちの知恵で、あなたの人生をより豊かにしましょう。
          </p>
          <Link 
            href="/auth/signup"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg inline-block"
          >
            無料でアカウント作成
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">📅</span>
            <span className="text-lg font-semibold text-gray-900">偉人カレンダー</span>
          </div>
          <p className="text-gray-600">
            © 2024 偉人カレンダー. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
