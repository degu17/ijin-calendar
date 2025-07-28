"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState("")
  const router = useRouter()

  // パスワード強度チェック
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength("パスワードは8文字以上で入力してください")
      return false
    }
    
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const charTypeCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecial].filter(Boolean).length
    
    if (charTypeCount < 2) {
      setPasswordStrength("パスワードには英大文字、英小文字、数字、記号のうち2種類以上を含めてください")
      return false
    }
    
    setPasswordStrength("")
    return true
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // クライアントサイドバリデーション
    if (!email || !password || !name) {
      setError("全ての項目を入力してください")
      setLoading(false)
      return
    }

    if (!checkPasswordStrength(password)) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const result = await response.json()

      if (response.ok) {
        // 登録成功 - ログインページにリダイレクト
        router.push("/auth/signin?message=registration-success")
      } else {
        setError(result.message || "登録に失敗しました")
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            偉人カレンダーで学習を始めましょう
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="田中太郎"
              />
            </div>

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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="安全なパスワードを入力"
              />
              {passwordStrength && (
                <p className="mt-1 text-sm text-red-600">{passwordStrength}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                8文字以上で、英大文字・英小文字・数字・記号のうち2種類以上を含めてください
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!passwordStrength}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登録中..." : "アカウントを作成"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちですか？{" "}
              <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
                ログイン
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 