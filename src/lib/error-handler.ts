/**
 * 包括的エラーハンドリングシステム
 * API レスポンス統一、フロントエンドエラー処理、ログ記録を提供します
 */

// エラータイプの定義
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
  NETWORK = 'NETWORK'
}

// エラーレベルの定義
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// アプリケーションエラークラス
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly level: ErrorLevel
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    level: ErrorLevel = ErrorLevel.ERROR,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    
    this.name = this.constructor.name
    this.type = type
    this.level = level
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.timestamp = new Date()
    this.context = context

    // スタックトレースをキャプチャ
    Error.captureStackTrace(this, this.constructor)
  }
}

// 特定のエラータイプ用のクラス
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorType.VALIDATION, 400, ErrorLevel.WARNING, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '認証が必要です', context?: Record<string, any>) {
    super(message, ErrorType.AUTHENTICATION, 401, ErrorLevel.WARNING, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'このリソースへのアクセス権限がありません', context?: Record<string, any>) {
    super(message, ErrorType.AUTHORIZATION, 403, ErrorLevel.WARNING, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません', context?: Record<string, any>) {
    super(message, ErrorType.NOT_FOUND, 404, ErrorLevel.INFO, true, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'リクエスト制限に達しました', context?: Record<string, any>) {
    super(message, ErrorType.RATE_LIMIT, 429, ErrorLevel.WARNING, true, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'データベースエラーが発生しました', context?: Record<string, any>) {
    super(message, ErrorType.DATABASE, 500, ErrorLevel.ERROR, true, context)
  }
}

// エラーレスポンス形式の統一
export interface ErrorResponse {
  success: false
  error: {
    type: string
    message: string
    code?: string
    timestamp: string
    requestId?: string
    details?: Record<string, any>
  }
}

// 成功レスポンス形式
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
  requestId?: string
}

/**
 * エラーを適切なHTTPレスポンスに変換
 * @param error エラーオブジェクト
 * @param requestId リクエストID（オプション）
 * @returns Response
 */
export function errorToResponse(error: unknown, requestId?: string): Response {
  let appError: AppError

  // エラーの正規化
  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    appError = new AppError(
      error.message || '予期しないエラーが発生しました',
      ErrorType.INTERNAL,
      500,
      ErrorLevel.ERROR,
      false
    )
  } else {
    appError = new AppError(
      '予期しないエラーが発生しました',
      ErrorType.INTERNAL,
      500,
      ErrorLevel.ERROR,
      false
    )
  }

  // ユーザーに表示するメッセージの調整
  let userMessage = appError.message
  if (!appError.isOperational || appError.level === ErrorLevel.CRITICAL) {
    userMessage = 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。'
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: appError.type,
      message: userMessage,
      timestamp: appError.timestamp.toISOString(),
      requestId,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          originalMessage: appError.message,
          stack: appError.stack,
          context: appError.context
        }
      })
    }
  }

  return new Response(JSON.stringify(errorResponse), {
    status: appError.statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 成功レスポンスを生成
 * @param data レスポンスデータ
 * @param message 成功メッセージ（オプション）
 * @param requestId リクエストID（オプション）
 * @returns Response
 */
export function successResponse<T>(
  data: T, 
  message?: string, 
  requestId?: string,
  status: number = 200
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * APIルート用のエラーハンドリングラッパー
 * @param handler APIハンドラー関数
 * @returns ラップされたハンドラー
 */
export function withErrorHandling(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      // リクエストIDの生成（簡易版）
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // エラーログ記録
      console.error('API Error:', {
        requestId,
        method: request.method,
        url: request.url,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString()
      })

      return errorToResponse(error, requestId)
    }
  }
}

/**
 * データベースエラーを適切なAppErrorに変換
 * @param error Prismaエラーまたは一般的なデータベースエラー
 * @returns AppError
 */
export function handleDatabaseError(error: any): AppError {
  // Prismaエラーの処理
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return new ValidationError('既に存在するデータです', { 
          fields: error.meta?.target 
        })
      case 'P2025':
        return new NotFoundError('指定されたレコードが見つかりません')
      case 'P2003':
        return new ValidationError('関連するデータが存在しません')
      case 'P1001':
        return new DatabaseError('データベースに接続できません')
      default:
        return new DatabaseError('データベースエラーが発生しました', {
          code: error.code,
          meta: error.meta
        })
    }
  }

  // 一般的なデータベースエラー
  if (error.message?.includes('connection')) {
    return new DatabaseError('データベース接続エラーが発生しました')
  }

  return new DatabaseError('データベース操作でエラーが発生しました')
}

/**
 * バリデーションエラーを統一形式で処理
 * @param errors バリデーションエラー配列
 * @returns ValidationError
 */
export function handleValidationErrors(errors: string[]): ValidationError {
  return new ValidationError(
    '入力値に問題があります',
    { validationErrors: errors }
  )
}

/**
 * フロントエンド用のエラーハンドリングユーティリティ
 */
export class ClientErrorHandler {
  /**
   * APIレスポンスエラーを処理
   * @param response fetch Response
   * @returns Promise<never>
   */
  static async handleApiError(response: Response): Promise<never> {
    let errorData: any

    try {
      errorData = await response.json()
    } catch {
      errorData = { 
        error: { 
          message: 'サーバーエラーが発生しました',
          type: ErrorType.INTERNAL 
        } 
      }
    }

    throw new AppError(
      errorData.error?.message || 'APIエラーが発生しました',
      errorData.error?.type || ErrorType.INTERNAL,
      response.status
    )
  }

  /**
   * ネットワークエラーを処理
   * @param error fetch error
   * @returns AppError
   */
  static handleNetworkError(error: any): AppError {
    if (error.name === 'AbortError') {
      return new AppError('リクエストがキャンセルされました', ErrorType.NETWORK, 0)
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new AppError(
        'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        ErrorType.NETWORK,
        0
      )
    }

    return new AppError(
      '予期しないエラーが発生しました',
      ErrorType.INTERNAL,
      0
    )
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   * @param error エラーオブジェクト
   * @returns ユーザー向けメッセージ
   */
  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message
      case ErrorType.AUTHENTICATION:
        return 'ログインが必要です。再度ログインしてください。'
      case ErrorType.AUTHORIZATION:
        return 'この操作を実行する権限がありません。'
      case ErrorType.NOT_FOUND:
        return '該当するデータが見つかりませんでした。'
      case ErrorType.RATE_LIMIT:
        return 'リクエストが多すぎます。しばらく時間をおいて再度お試しください。'
      case ErrorType.NETWORK:
        return 'ネットワークエラーが発生しました。接続を確認してください。'
      default:
        return 'エラーが発生しました。しばらく時間をおいて再度お試しください。'
    }
  }
}

/**
 * React Error Boundary用のエラーハンドラー
 * @param error エラーオブジェクト
 * @param errorInfo エラー情報
 */
export function logReactError(error: Error, errorInfo: any): void {
  console.error('React Error:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    errorInfo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })

  // 本番環境では外部ログサービスに送信
  // if (process.env.NODE_ENV === 'production') {
  //   // 外部ログサービスへの送信処理
  // }
} 