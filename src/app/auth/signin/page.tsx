"use client"

import { useState, useEffect } from "react"
import { signIn, getProviders } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

// エラーメッセージの定義
const ERROR_MESSAGES = {
  CredentialsSignin: "メールアドレスまたはパスワードが正しくありません",
  OAuthSignin: "Google認証でエラーが発生しました",
  OAuthCallback: "認証中にエラーが発生しました",
  OAuthCreateAccount: "アカウント作成中にエラーが発生しました",
  EmailCreateAccount: "メールアドレスでのアカウント作成に失敗しました",
  Callback: "認証コールバックでエラーが発生しました",
  OAuthAccountNotLinked: "このメールアドレスは既に別の方法で登録されています",
  EmailSignin: "メール認証でエラーが発生しました",
  CredentialsSignup: "アカウント作成中にエラーが発生しました",
  SessionRequired: "ログインが必要です",
  Default: "ログインに失敗しました。しばらく時間をおいて再度お試しください"
} as const

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // URLパラメータからのエラー処理とログイン試行制限の初期化
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      const errorMessage = ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.Default
      setError(errorMessage)
    }

    // ローカルストレージからログイン試行回数を取得
    const savedAttempts = localStorage.getItem('loginAttempts')
    const savedBlockTime = localStorage.getItem('loginBlockTime')
    
    if (savedAttempts) {
      setAttemptCount(parseInt(savedAttempts))
    }

    if (savedBlockTime) {
      const blockEndTime = parseInt(savedBlockTime)
      const now = Date.now()
      
      if (now < blockEndTime) {
        setIsBlocked(true)
        setBlockTime(blockEndTime)
        
        // ブロック解除のタイマー
        const timeRemaining = blockEndTime - now
        setTimeout(() => {
          setIsBlocked(false)
          setBlockTime(null)
          setAttemptCount(0)
          localStorage.removeItem('loginAttempts')
          localStorage.removeItem('loginBlockTime')
        }, timeRemaining)
      } else {
        // ブロック時間が過ぎていたらリセット
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('loginBlockTime')
      }
    }
  }, [searchParams])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ブロック中はログインを防ぐ
    if (isBlocked) {
      const remainingTime = blockTime ? Math.ceil((blockTime - Date.now()) / 1000 / 60) : 0
      setError(`ログイン試行回数が上限に達しました。${remainingTime}分後に再度お試しください。`)
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const newAttemptCount = attemptCount + 1
        setAttemptCount(newAttemptCount)
        localStorage.setItem('loginAttempts', newAttemptCount.toString())

        // 5回失敗でブロック（15分間）
        if (newAttemptCount >= 5) {
          const blockEndTime = Date.now() + (15 * 60 * 1000) // 15分
          setIsBlocked(true)
          setBlockTime(blockEndTime)
          localStorage.setItem('loginBlockTime', blockEndTime.toString())
          setError("ログイン試行回数が上限に達しました。15分後に再度お試しください。")
        } else {
          const errorMessage = ERROR_MESSAGES[result.error as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.CredentialsSignin
          const remainingAttempts = 5 - newAttemptCount
          setError(`${errorMessage}（あと${remainingAttempts}回まで試行可能）`)
        }
      } else {
        // ログイン成功時はカウンターをリセット
        setAttemptCount(0)
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('loginBlockTime')
        router.push("/dashboard")
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(ERROR_MESSAGES.Default)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError("")
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(ERROR_MESSAGES.OAuthSignin)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            サインイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            偉人カレンダーにアクセスしましょう
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsSignIn}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="your-email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワードを入力"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "サインイン中..." : isBlocked ? "ブロック中" : "サインイン"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Googleでサインイン
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 