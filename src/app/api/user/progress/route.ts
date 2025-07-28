import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserProgress, recordPersonView, isValidPersonId } from "@/lib/progress-service"
import { checkRateLimit, getClientIP, DEFAULT_RATE_LIMITS } from "@/lib/rate-limit"
import { sanitizeText, sanitizeRequest, hasSqlInjectionPattern } from "@/lib/sanitize"
import { logger } from "@/lib/logger"
import { errorToResponse, successResponse, ValidationError, AuthenticationError, RateLimitError } from "@/lib/error-handler"

/**
 * ユーザー進捗データ取得API
 * 
 * GET /api/user/progress
 * 
 * レスポンス:
 * {
 *   success: boolean,
 *   data: UserProgress
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let userEmail: string | undefined
  
  try {
    // レート制限チェック
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(
      `progress-get:${clientIP}`,
      DEFAULT_RATE_LIMITS.progress
    )

    if (!rateLimitResult.allowed) {
      logger.warn('進捗取得API: レート制限に達しました', {
        ip: clientIP,
        resetTime: rateLimitResult.resetTime,
        endpoint: '/api/user/progress'
      })
      
      throw new RateLimitError(rateLimitResult.message)
    }

    // セッション確認
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      logger.warn('進捗取得API: 未認証アクセス', {
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new AuthenticationError("認証が必要です")
    }
    
    userEmail = session.user.email

    // ユーザー情報を取得してIDを得る
    const { getUserByEmail } = await import("@/lib/user-service")
    const user = await getUserByEmail(userEmail!)
    
    if (!user) {
      logger.warn('進捗取得API: ユーザーデータが見つかりません', {
        email: userEmail,
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("ユーザーデータが見つかりません")
    }

    // 進捗データ取得
    const progressData = await getUserProgress(user.id)

    if (!progressData) {
      logger.warn('進捗取得API: 進捗データが見つかりません', {
        userId: user.id,
        email: userEmail,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("進捗データが見つかりません")
    }

    // 成功ログ
    const duration = Date.now() - startTime
    logger.info('進捗取得API: 成功', {
      userId: user.id,
      email: userEmail,
      ip: clientIP,
      duration: `${duration}ms`,
      endpoint: '/api/user/progress'
    })

    return successResponse(progressData, "進捗データを取得しました")

  } catch (error) {
    const duration = Date.now() - startTime
    const clientIP = getClientIP(request)
    
    // エラーログ記録
    if (error instanceof Error) {
      console.error('進捗取得API: エラー', {
        message: error.message,
        email: userEmail,
        ip: clientIP,
        duration: `${duration}ms`,
        endpoint: '/api/user/progress',
        stack: error.stack
      })
    } else {
      console.error('進捗取得API: 未知のエラー', {
        error,
        email: userEmail,
        ip: clientIP,
        duration: `${duration}ms`,
        endpoint: '/api/user/progress'
      })
    }
    
    return errorToResponse(error)
  }
}

/**
 * 偉人閲覧記録更新API
 * 
 * POST /api/user/progress
 * 
 * リクエストボディ:
 * {
 *   personId: string,
 *   date: string (YYYY-MM-DD)
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userEmail: string | undefined
  
  try {
    // レート制限チェック
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(
      `progress-post:${clientIP}`,
      DEFAULT_RATE_LIMITS.progress
    )

    if (!rateLimitResult.allowed) {
      logger.warn('進捗更新API: レート制限に達しました', {
        ip: clientIP,
        resetTime: rateLimitResult.resetTime,
        endpoint: '/api/user/progress'
      })
      
      throw new RateLimitError(rateLimitResult.message)
    }

    // セッション確認
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      logger.warn('進捗更新API: 未認証アクセス', {
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new AuthenticationError("認証が必要です")
    }
    
    userEmail = session.user.email

    // ユーザー情報を取得してIDを得る
    const { getUserByEmail } = await import("@/lib/user-service")
    const user = await getUserByEmail(userEmail!)
    
    if (!user) {
      logger.warn('進捗更新API: ユーザーデータが見つかりません', {
        email: userEmail,
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("ユーザーデータが見つかりません")
    }

    // リクエストボディの取得と検証
    const body = await request.json()
    
    // 基本的な入力値サニタイゼーション
    let { personId, date } = body
    
    // 必須項目チェック
    if (!personId || !date) {
      throw new ValidationError("personIdとdateは必須項目です")
    }

    // 型チェック
    if (typeof personId !== 'string' || typeof date !== 'string') {
      throw new ValidationError("入力値の形式が正しくありません")
    }

    // 入力値のサニタイゼーション
    personId = sanitizeText(personId, 100)
    date = sanitizeText(date, 20)
    
    // SQLインジェクション対策
    if (hasSqlInjectionPattern(personId) || hasSqlInjectionPattern(date)) {
      logger.warn('進捗更新API: SQLインジェクション試行を検出', {
        personId,
        date,
        userId: user.id,
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("不正な文字が含まれています")
    }

    // 偉人IDの妥当性チェック
    if (!isValidPersonId(personId)) {
      logger.warn('進捗更新API: 無効な偉人ID', {
        personId,
        userId: user.id,
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("無効な偉人IDです")
    }

    // 日付の妥当性チェック（YYYY-MM-DD形式）
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      throw new ValidationError("日付の形式が正しくありません（YYYY-MM-DD形式で入力してください）")
    }

    // 日付が有効かチェック
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().split('T')[0] !== date) {
      throw new ValidationError("無効な日付です")
    }

    // 未来の日付をチェック
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      throw new ValidationError("未来の日付は指定できません")
    }

    // 偉人閲覧記録を更新
    logger.info('進捗更新API: 記録更新開始', {
      personId,
      date,
      userId: user.id,
      email: userEmail,
      ip: clientIP,
      endpoint: '/api/user/progress'
    })
    
    const success = await recordPersonView(user.id, personId, date)

    if (!success) {
      logger.warn('進捗更新API: 記録更新失敗', {
        personId,
        date,
        userId: user.id,
        ip: clientIP,
        endpoint: '/api/user/progress'
      })
      
      throw new ValidationError("閲覧記録の更新に失敗しました")
    }

    // 更新後の進捗データを取得して返す
    const updatedProgress = await getUserProgress(user.id)

    // 成功ログ
    const duration = Date.now() - startTime
    logger.info('進捗更新API: 成功', {
      personId,
      date,
      userId: user.id,
      email: userEmail,
      ip: clientIP,
      duration: `${duration}ms`,
      endpoint: '/api/user/progress'
    })

    return successResponse(updatedProgress, "閲覧記録を更新しました")

  } catch (error) {
    const duration = Date.now() - startTime
    const clientIP = getClientIP(request)
    
    // エラーログ記録
    if (error instanceof Error) {
      console.error('進捗更新API: エラー', {
        message: error.message,
        email: userEmail,
        ip: clientIP,
        duration: `${duration}ms`,
        endpoint: '/api/user/progress',
        stack: error.stack
      })
    } else {
      console.error('進捗更新API: 未知のエラー', {
        error,
        email: userEmail,
        ip: clientIP,
        duration: `${duration}ms`,
        endpoint: '/api/user/progress'
      })
    }
    
    return errorToResponse(error)
  }
}

/**
 * 許可されていないHTTPメソッドへの対応
 */
export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request)
  
  logger.warn('進捗API: 許可されていないメソッド', {
    method: 'PUT',
    ip: clientIP,
    endpoint: '/api/user/progress'
  })
  
  return errorToResponse(
    new ValidationError("このエンドポイントはGETとPOSTメソッドのみサポートしています")
  )
}

export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request)
  
  logger.warn('進捗API: 許可されていないメソッド', {
    method: 'DELETE',
    ip: clientIP,
    endpoint: '/api/user/progress'
  })
  
  return errorToResponse(
    new ValidationError("このエンドポイントはGETとPOSTメソッドのみサポートしています")
  )
} 