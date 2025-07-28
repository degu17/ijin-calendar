/**
 * レート制限機能
 * API呼び出し頻度制限とブルートフォース攻撃対策を提供します
 */

// インメモリストレージ（本番環境ではRedisを使用することを推奨）
const rateLimitStore = new Map<string, {
  requests: { timestamp: number }[]
  blockedUntil?: number
}>()

// 設定インターface
export interface RateLimitConfig {
  windowMs: number        // 時間窓（ミリ秒）
  maxRequests: number     // 最大リクエスト数
  blockDurationMs: number // ブロック時間（ミリ秒）
  message?: string        // ブロック時のメッセージ
}

// デフォルト設定
export const DEFAULT_RATE_LIMITS = {
  // 一般的なAPI
  general: {
    windowMs: 15 * 60 * 1000,    // 15分
    maxRequests: 100,             // 100リクエスト
    blockDurationMs: 15 * 60 * 1000, // 15分ブロック
    message: 'リクエストが多すぎます。しばらく時間をおいて再度お試しください。'
  },

  // 認証関連API（より厳しい制限）
  auth: {
    windowMs: 15 * 60 * 1000,    // 15分
    maxRequests: 5,               // 5回のログイン試行
    blockDurationMs: 30 * 60 * 1000, // 30分ブロック
    message: 'ログイン試行回数が上限に達しました。30分後に再度お試しください。'
  },

  // サインアップAPI
  signup: {
    windowMs: 60 * 60 * 1000,    // 1時間
    maxRequests: 3,               // 3回のサインアップ試行
    blockDurationMs: 60 * 60 * 1000, // 1時間ブロック
    message: 'アカウント作成の試行回数が上限に達しました。1時間後に再度お試しください。'
  },

  // パスワードリセット
  passwordReset: {
    windowMs: 60 * 60 * 1000,    // 1時間
    maxRequests: 3,               // 3回のパスワードリセット
    blockDurationMs: 60 * 60 * 1000, // 1時間ブロック
    message: 'パスワードリセットの試行回数が上限に達しました。1時間後に再度お試しください。'
  },

  // 進捗更新API
  progress: {
    windowMs: 60 * 1000,         // 1分
    maxRequests: 30,              // 30リクエスト/分
    blockDurationMs: 5 * 60 * 1000, // 5分ブロック
    message: '進捗の更新が多すぎます。5分間お待ちください。'
  }
} as const

/**
 * IPアドレスまたはユーザーIDベースのレート制限チェック
 * @param identifier 識別子（IPアドレスまたはユーザーID）
 * @param config レート制限設定
 * @returns 制限結果
 */
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): {
  allowed: boolean
  remainingRequests: number
  resetTime: number
  message?: string
} {
  const now = Date.now()
  const key = identifier

  // 現在の状態を取得または初期化
  let state = rateLimitStore.get(key) || { requests: [] }

  // ブロック状態のチェック
  if (state.blockedUntil && now < state.blockedUntil) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: state.blockedUntil,
      message: config.message
    }
  }

  // ブロック期間が過ぎた場合、ブロック状態をクリア
  if (state.blockedUntil && now >= state.blockedUntil) {
    state.blockedUntil = undefined
    state.requests = []
  }

  // 時間窓外の古いリクエストを削除
  const windowStart = now - config.windowMs
  state.requests = state.requests.filter(req => req.timestamp > windowStart)

  // リクエスト数チェック
  if (state.requests.length >= config.maxRequests) {
    // 制限を超えた場合、ブロック状態に設定
    state.blockedUntil = now + config.blockDurationMs
    rateLimitStore.set(key, state)

    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: state.blockedUntil,
      message: config.message
    }
  }

  // 新しいリクエストを記録
  state.requests.push({ timestamp: now })
  rateLimitStore.set(key, state)

  return {
    allowed: true,
    remainingRequests: config.maxRequests - state.requests.length,
    resetTime: windowStart + config.windowMs,
    message: undefined
  }
}

/**
 * 複数の制限ルールを組み合わせてチェック
 * @param identifier 識別子
 * @param rules 適用するルール配列
 * @returns 制限結果
 */
export function checkMultipleRateLimits(
  identifier: string,
  rules: { name: string; config: RateLimitConfig }[]
): {
  allowed: boolean
  failedRule?: string
  message?: string
  remainingRequests: number
  resetTime: number
} {
  for (const rule of rules) {
    const result = checkRateLimit(`${rule.name}:${identifier}`, rule.config)
    
    if (!result.allowed) {
      return {
        allowed: false,
        failedRule: rule.name,
        message: result.message,
        remainingRequests: result.remainingRequests,
        resetTime: result.resetTime
      }
    }
  }

  // すべてのルールを通過した場合、最も厳しい制限の情報を返す
  const firstRule = rules[0]
  const firstResult = checkRateLimit(`${firstRule.name}:${identifier}`, firstRule.config)

  return {
    allowed: true,
    remainingRequests: firstResult.remainingRequests,
    resetTime: firstResult.resetTime
  }
}

/**
 * Next.js APIルート用のレート制限ミドルウェア
 * @param identifier 識別子
 * @param config レート制限設定
 * @returns Response（制限時）またはnull（通過時）
 */
export function rateLimitMiddleware(
  identifier: string,
  config: RateLimitConfig
): Response | null {
  const result = checkRateLimit(identifier, config)

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        message: result.message || 'レート制限により一時的にアクセスが制限されています',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': result.remainingRequests.toString(),
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
  }

  return null
}

/**
 * IPアドレスを取得するヘルパー関数
 * @param request Next.js Request
 * @returns IPアドレス
 */
export function getClientIP(request: Request): string {
  // ヘッダーからIPアドレスを取得（プロキシ対応）
  const headers = request.headers
  
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const clientIP = headers.get('x-client-ip')
  if (clientIP) {
    return clientIP
  }

  // フォールバック（開発環境）
  return 'unknown'
}

/**
 * レート制限情報を取得（デバッグ用）
 * @param identifier 識別子
 * @returns 現在のレート制限状態
 */
export function getRateLimitInfo(identifier: string): {
  requests: number
  isBlocked: boolean
  blockedUntil?: number
} {
  const state = rateLimitStore.get(identifier)
  
  if (!state) {
    return { requests: 0, isBlocked: false }
  }

  const now = Date.now()
  const isBlocked = state.blockedUntil ? now < state.blockedUntil : false

  return {
    requests: state.requests.length,
    isBlocked,
    blockedUntil: state.blockedUntil
  }
}

/**
 * 特定の識別子のレート制限をリセット（管理用）
 * @param identifier 識別子
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * 全てのレート制限データをクリア（管理用）
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear()
}

/**
 * 期限切れのレート制限データをクリーンアップ
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now()
  
  for (const [key, state] of rateLimitStore.entries()) {
    // ブロック期間が過ぎていて、リクエスト履歴も古い場合は削除
    const shouldCleanup = (
      (!state.blockedUntil || now >= state.blockedUntil) &&
      state.requests.every(req => now - req.timestamp > 24 * 60 * 60 * 1000) // 24時間以上古い
    )

    if (shouldCleanup) {
      rateLimitStore.delete(key)
    }
  }
}

// 定期的なクリーンアップ（1時間ごと）
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRateLimits, 60 * 60 * 1000)
} 