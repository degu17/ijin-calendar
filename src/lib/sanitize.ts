/**
 * 入力値サニタイゼーション機能
 * XSS対策とデータ検証を提供します
 */

/**
 * HTMLエスケープによるXSS対策
 * @param text エスケープする文字列
 * @returns エスケープされた安全な文字列
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return ''
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  return text.replace(/[&<>"'`=\/]/g, (char) => map[char] || char)
}

/**
 * URLのサニタイゼーション
 * @param url 検証するURL
 * @returns 安全なURLまたは空文字列
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }

  // 基本的なURL形式チェック
  try {
    const parsedUrl = new URL(url)
    
    // 許可されるプロトコル
    const allowedProtocols = ['http:', 'https:', 'mailto:']
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return ''
    }

    return parsedUrl.toString()
  } catch {
    return ''
  }
}

/**
 * メールアドレスのサニタイゼーション
 * @param email 検証するメールアドレス
 * @returns 正規化されたメールアドレスまたは空文字列
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  // 基本的な正規化
  const normalized = email.trim().toLowerCase()

  // 基本的なメール形式チェック
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(normalized)) {
    return ''
  }

  // 長さ制限
  if (normalized.length > 254) {
    return ''
  }

  return normalized
}

/**
 * 名前の入力値サニタイゼーション
 * @param name 検証する名前
 * @returns サニタイズされた名前
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') {
    return ''
  }

  // 基本的な正規化
  let sanitized = name.trim()

  // HTMLエスケープ
  sanitized = escapeHtml(sanitized)

  // 長さ制限（1-100文字）
  if (sanitized.length === 0 || sanitized.length > 100) {
    return ''
  }

  // 特殊文字の制限（基本的な文字のみ許可）
  const allowedChars = /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\s\-_.]+$/
  if (!allowedChars.test(sanitized)) {
    return ''
  }

  return sanitized
}

/**
 * パスワードの基本検証
 * @param password 検証するパスワード
 * @returns 検証結果
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (typeof password !== 'string') {
    return { isValid: false, errors: ['パスワードが無効です'] }
  }

  // 長さチェック
  if (password.length < 8) {
    errors.push('パスワードは8文字以上で入力してください')
  }

  if (password.length > 128) {
    errors.push('パスワードは128文字以内で入力してください')
  }

  // 文字種チェック
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const charTypeCount = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecial].filter(Boolean).length

  if (charTypeCount < 2) {
    errors.push('パスワードには英大文字、英小文字、数字、記号のうち2種類以上を含めてください')
  }

  // よくあるパスワードパターンのチェック
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^guest/i
  ]

  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('より複雑なパスワードを設定してください')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 一般的なテキスト入力のサニタイゼーション
 * @param text サニタイズするテキスト
 * @param maxLength 最大長（デフォルト: 1000）
 * @returns サニタイズされたテキスト
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (typeof text !== 'string') {
    return ''
  }

  // 基本的な正規化
  let sanitized = text.trim()

  // HTMLエスケープ
  sanitized = escapeHtml(sanitized)

  // 長さ制限
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * JSONペイロードの基本検証
 * @param payload 検証するペイロード
 * @param maxSize 最大サイズ（バイト、デフォルト: 1MB）
 * @returns 検証結果
 */
export function validateJsonPayload(payload: any, maxSize: number = 1024 * 1024): {
  isValid: boolean
  error?: string
} {
  try {
    const jsonString = JSON.stringify(payload)
    
    // サイズチェック
    const size = Buffer.byteLength(jsonString, 'utf8')
    if (size > maxSize) {
      return {
        isValid: false,
        error: `ペイロードサイズが制限を超えています（${size}バイト > ${maxSize}バイト）`
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'JSONペイロードが無効です'
    }
  }
}

/**
 * SQLインジェクション対策のための文字列チェック
 * @param input チェックする文字列
 * @returns 危険なパターンが含まれているかどうか
 */
export function hasSqlInjectionPattern(input: string): boolean {
  if (typeof input !== 'string') {
    return false
  }

  // SQLインジェクションでよく使われるパターン
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/)/,
    /(\b(EXEC|EXECUTE)\s*\()/i,
    /(\bCONCAT\s*\()/i,
    /(\bCHAR\s*\()/i
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * リクエスト全体のサニタイゼーション
 * @param req リクエストオブジェクト（一般的な形式）
 * @returns サニタイズ結果
 */
export function sanitizeRequest(req: {
  email?: string
  password?: string
  name?: string
  [key: string]: any
}): {
  isValid: boolean
  sanitized: Record<string, any>
  errors: string[]
} {
  const errors: string[] = []
  const sanitized: Record<string, any> = {}

  // メールアドレスのサニタイゼーション
  if (req.email !== undefined) {
    const sanitizedEmail = sanitizeEmail(req.email)
    if (req.email && !sanitizedEmail) {
      errors.push('メールアドレスの形式が正しくありません')
    } else {
      sanitized.email = sanitizedEmail
    }
  }

  // パスワードの検証
  if (req.password !== undefined) {
    const passwordValidation = validatePassword(req.password)
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    } else {
      sanitized.password = req.password // パスワードはハッシュ化前なのでそのまま
    }
  }

  // 名前のサニタイゼーション
  if (req.name !== undefined) {
    const sanitizedName = sanitizeName(req.name)
    if (req.name && !sanitizedName) {
      errors.push('名前の形式が正しくありません')
    } else {
      sanitized.name = sanitizedName
    }
  }

  // その他のフィールドの基本的なサニタイゼーション
  Object.keys(req).forEach(key => {
    if (!['email', 'password', 'name'].includes(key)) {
      if (typeof req[key] === 'string') {
        // SQLインジェクションパターンチェック
        if (hasSqlInjectionPattern(req[key])) {
          errors.push(`${key}フィールドに不正な文字が含まれています`)
        } else {
          sanitized[key] = sanitizeText(req[key])
        }
      } else {
        sanitized[key] = req[key]
      }
    }
  })

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  }
} 