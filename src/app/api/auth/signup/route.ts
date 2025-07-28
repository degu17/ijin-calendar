import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/user-service"
import { sanitizeRequest, validateJsonPayload } from "@/lib/sanitize"
import { rateLimitMiddleware, getClientIP, DEFAULT_RATE_LIMITS } from "@/lib/rate-limit"
import { withErrorHandling, ValidationError, handleDatabaseError, successResponse } from "@/lib/error-handler"
import { logger, securityEvents } from "@/lib/logger"

/**
 * 新規ユーザー登録API
 * 
 * POST /api/auth/signup
 * 
 * リクエストボディ:
 * {
 *   email: string,
 *   password: string,
 *   name: string
 * }
 */
const signupHandler = async (request: Request) => {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // レート制限チェック
  const rateLimitResponse = rateLimitMiddleware(
    `signup:${clientIP}`,
    DEFAULT_RATE_LIMITS.signup
  )
  
  if (rateLimitResponse) {
    logger.warn('Signup rate limit exceeded', { clientIP, userAgent })
    return rateLimitResponse
  }

  // リクエストボディの取得と基本検証
  const body = await request.json()

  // JSONペイロードサイズ検証
  const payloadValidation = validateJsonPayload(body)
  if (!payloadValidation.isValid) {
    throw new ValidationError(payloadValidation.error || 'ペイロードが無効です')
  }

  // 入力値のサニタイゼーション
  const sanitization = sanitizeRequest(body)
  if (!sanitization.isValid) {
    logger.warn('Signup validation failed', { 
      errors: sanitization.errors,
      clientIP,
      userAgent 
    })
    throw new ValidationError(sanitization.errors.join(', '))
  }

  const { email, password, name } = sanitization.sanitized

  try {
    // ユーザー作成処理
    logger.info('User signup attempt', { email, clientIP, userAgent })
    const newUser = await createUser(email, password, name)

    // 成功ログ
    logger.auth('User signup successful', {
      userId: newUser.id,
      email: newUser.email,
      clientIP,
      userAgent
    })

    // 成功レスポンス（パスワードは含めない）
    return successResponse(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
        },
      },
      "アカウントが正常に作成されました",
      undefined,
      201
    )

  } catch (error) {
    // データベースエラーの適切な処理
    if (error instanceof Error) {
      // 重複メールアドレスエラーの場合
      if (error.message.includes("既に登録されています")) {
        securityEvents.suspiciousActivity(
          `Duplicate email signup attempt: ${email}`,
          undefined,
          clientIP
        )
        throw new ValidationError("このメールアドレスは既に登録されています")
      }

      // データベースエラー
      throw handleDatabaseError(error)
    }

    throw error
  }
}

export const POST = withErrorHandling(signupHandler)

/**
 * 許可されていないHTTPメソッドへの対応
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      message: "このエンドポイントはPOSTメソッドのみサポートしています" 
    },
    { status: 405 }
  )
} 