import { prisma } from "./prisma"
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password"

/**
 * 新規ユーザー作成
 * 
 * 【学習ポイント】ユーザー作成時のセキュリティチェック
 * 1. 入力値検証（必須項目、形式チェック）
 * 2. 重複チェック（同じメールアドレスで登録済みかどうか）
 * 3. パスワード強度チェック
 * 4. パスワードハッシュ化
 * 5. データベースに安全に保存
 */
export async function createUser(email: string, password: string, name: string) {
  // === 入力値検証 ===
  if (!email || !password || !name) {
    throw new Error("必須項目が入力されていません")
  }

  // メールアドレス形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error("有効なメールアドレスを入力してください")
  }

  // パスワード強度チェック
  const passwordError = validatePasswordStrength(password)
  if (passwordError) {
    throw new Error(passwordError)
  }

  // === 重複チェック ===
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() } // メールアドレスは小文字で統一
  })

  if (existingUser) {
    throw new Error("このメールアドレスは既に登録されています")
  }

  // === 安全なユーザー作成 ===
  try {
    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password)

    // ユーザーをデータベースに作成
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(), // 前後の空白を削除
        password: hashedPassword,
        currentProgress: 0, // 偉人閲覧進捗の初期値
        viewedGreatPeople: [], // 見た偉人のリスト（初期は空）
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // パスワードは返さない（セキュリティ）
      }
    })

    return newUser
  } catch (error) {
    console.error("ユーザー作成エラー:", error)
    throw new Error("ユーザーの作成に失敗しました")
  }
}

/**
 * ログイン認証
 * 
 * 【学習ポイント】認証時のセキュリティ考慮
 * 1. メールアドレスでユーザーを検索
 * 2. パスワードを安全に照合
 * 3. 成功時にはパスワード以外の情報を返す
 * 4. 失敗時には詳細な理由を隠す（セキュリティ）
 */
export async function authenticateUser(email: string, password: string) {
  // === 入力値検証 ===
  if (!email || !password) {
    return null // 認証失敗
  }

  try {
    // === ユーザー検索 ===
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // パスワード照合のために取得
        currentProgress: true,
        viewedGreatPeople: true,
      }
    })

    // ユーザーが存在しない場合
    if (!user || !user.password) {
      return null // 認証失敗（詳細な理由は返さない）
    }

    // === パスワード照合 ===
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      return null // 認証失敗
    }

    // === 認証成功：パスワード以外の情報を返す ===
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      currentProgress: user.currentProgress,
      viewedGreatPeople: user.viewedGreatPeople,
    }

  } catch (error) {
    console.error("認証エラー:", error)
    return null // エラー時も認証失敗扱い
  }
}

/**
 * メールアドレスでユーザー情報取得
 * 
 * OAuth認証後にユーザー情報を取得する際に使用
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        currentProgress: true,
        viewedGreatPeople: true,
        // パスワードは返さない
      }
    })

    return user
  } catch (error) {
    console.error("ユーザー取得エラー:", error)
    return null
  }
} 