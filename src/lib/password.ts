import bcrypt from "bcryptjs"

/**
 * パスワードのハッシュ化
 * 
 * 【学習ポイント】bcryptの仕組み
 * - saltRounds: ハッシュ化の複雑さ（高いほど安全だが処理時間増）
 * - 10 = 2^10 = 1024回の内部処理（現在推奨値）
 * - 同じパスワードでも毎回異なるハッシュ値が生成される（salt付与）
 */

const SALT_ROUNDS = 10

/**
 * パスワードをハッシュ化する
 * @param password 平文のパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // bcryptでハッシュ化（非同期処理）
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    return hashedPassword
  } catch (error) {
    // ハッシュ化に失敗した場合のエラーハンドリング
    console.error("パスワードハッシュ化エラー:", error)
    throw new Error("パスワードの処理に失敗しました")
  }
}

/**
 * パスワードを検証する（ログイン時）
 * @param password 平文のパスワード（ユーザー入力）
 * @param hashedPassword ハッシュ化されたパスワード（DB保存値）
 * @returns パスワードが一致するかどうか
 */
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    // bcryptで検証（元のパスワードと比較）
    const isValid = await bcrypt.compare(password, hashedPassword)
    return isValid
  } catch (error) {
    // 検証に失敗した場合のエラーハンドリング
    console.error("パスワード検証エラー:", error)
    return false // エラー時は認証失敗扱い
  }
}

/**
 * パスワード強度チェック
 * @param password チェックするパスワード
 * @returns エラーメッセージ（問題なければnull）
 */
export function validatePasswordStrength(password: string): string | null {
  // 最小長チェック
  if (password.length < 8) {
    return "パスワードは8文字以上で入力してください"
  }
  
  // 最大長チェック（DoS攻撃対策）
  if (password.length > 100) {
    return "パスワードは100文字以下で入力してください"
  }
  
  // 文字種チェック（推奨）
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const charTypeCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecial].filter(Boolean).length
  
  if (charTypeCount < 2) {
    return "パスワードには英大文字、英小文字、数字、記号のうち2種類以上を含めてください"
  }
  
  return null // 問題なし
} 