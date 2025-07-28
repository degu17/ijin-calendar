/**
 * 包括的ログシステム
 * セキュリティイベント、エラーログ、デバッグログの記録を提供します
 */

// ログレベルの定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// ログカテゴリの定義
export enum LogCategory {
  SECURITY = 'security',
  AUTH = 'auth',
  API = 'api',
  DATABASE = 'database',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  PERFORMANCE = 'performance'
}

// ログエントリーの型定義
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  stack?: string
}

// セキュリティイベントの型定義
export interface SecurityEvent {
  type: 'failed_login' | 'account_lockout' | 'suspicious_activity' | 'unauthorized_access' | 'data_access' | 'privilege_escalation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  additionalData?: Record<string, any>
}

class Logger {
  private minLevel: LogLevel
  private isProduction: boolean

  constructor() {
    this.minLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * 基本的なログメソッド
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      context,
      ...(error && { stack: error.stack }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.sessionId && { sessionId: context.sessionId }),
      ...(context?.ipAddress && { ipAddress: context.ipAddress }),
      ...(context?.userAgent && { userAgent: context.userAgent }),
      ...(context?.requestId && { requestId: context.requestId })
    }

    // コンソール出力
    this.outputToConsole(entry)

    // 本番環境では外部ログサービスに送信
    if (this.isProduction) {
      this.sendToExternalService(entry)
    }

    // ローカルファイルへの保存（開発環境）
    if (!this.isProduction) {
      this.saveToLocalFile(entry)
    }
  }

  /**
   * コンソールへの出力
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`
    const message = `${prefix} ${entry.message}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context)
        break
      case LogLevel.INFO:
        console.info(message, entry.context)
        break
      case LogLevel.WARN:
        console.warn(message, entry.context)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.context, entry.stack)
        break
    }
  }

  /**
   * 外部ログサービスへの送信（本番環境用）
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // 実際の実装では、適切な外部ログサービス（CloudWatch, Datadog等）のAPIを使用
      // await externalLogService.send(entry)
      
      // セキュリティイベントやクリティカルエラーの場合は即座にアラート
      if (entry.category === LogCategory.SECURITY || entry.level === LogLevel.CRITICAL) {
        // await alertService.sendAlert(entry)
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  /**
   * ローカルファイルへの保存（開発環境用）
   */
  private saveToLocalFile(entry: LogEntry): void {
    // 実際の実装ではファイルシステムAPIを使用
    // const logData = JSON.stringify(entry) + '\n'
    // fs.appendFileSync(`logs/${entry.category}-${new Date().toISOString().split('T')[0]}.log`, logData)
  }

  /**
   * デバッグログ
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, context)
  }

  /**
   * 情報ログ
   */
  info(message: string, context?: Record<string, any>, category: LogCategory = LogCategory.SYSTEM): void {
    this.log(LogLevel.INFO, category, message, context)
  }

  /**
   * 警告ログ
   */
  warn(message: string, context?: Record<string, any>, category: LogCategory = LogCategory.SYSTEM): void {
    this.log(LogLevel.WARN, category, message, context)
  }

  /**
   * エラーログ
   */
  error(message: string, error?: Error, context?: Record<string, any>, category: LogCategory = LogCategory.SYSTEM): void {
    this.log(LogLevel.ERROR, category, message, context, error)
  }

  /**
   * クリティカルエラーログ
   */
  critical(message: string, error?: Error, context?: Record<string, any>, category: LogCategory = LogCategory.SYSTEM): void {
    this.log(LogLevel.CRITICAL, category, message, context, error)
  }

  /**
   * セキュリティイベントログ
   */
  security(event: SecurityEvent, context?: Record<string, any>): void {
    const message = `Security Event: ${event.type} - ${event.description}`
    
    let level: LogLevel
    switch (event.severity) {
      case 'low':
        level = LogLevel.INFO
        break
      case 'medium':
        level = LogLevel.WARN
        break
      case 'high':
        level = LogLevel.ERROR
        break
      case 'critical':
        level = LogLevel.CRITICAL
        break
    }

    this.log(level, LogCategory.SECURITY, message, {
      ...context,
      securityEvent: event
    })
  }

  /**
   * 認証関連ログ
   */
  auth(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, LogCategory.AUTH, message, context)
  }

  /**
   * API アクセスログ
   */
  apiAccess(method: string, path: string, status: number, duration: number, context?: Record<string, any>): void {
    const message = `${method} ${path} - ${status} (${duration}ms)`
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    
    this.log(level, LogCategory.API, message, {
      ...context,
      method,
      path,
      status,
      duration
    })
  }

  /**
   * データベースアクセスログ
   */
  database(operation: string, table: string, duration?: number, context?: Record<string, any>): void {
    const message = `DB ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`
    
    this.log(LogLevel.DEBUG, LogCategory.DATABASE, message, {
      ...context,
      operation,
      table,
      duration
    })
  }

  /**
   * ユーザーアクションログ
   */
  userAction(action: string, userId: string, context?: Record<string, any>): void {
    const message = `User action: ${action}`
    
    this.log(LogLevel.INFO, LogCategory.USER_ACTION, message, {
      ...context,
      userId,
      action
    })
  }

  /**
   * パフォーマンスログ
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    const message = `Performance: ${operation} took ${duration}ms`
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO
    
    this.log(level, LogCategory.PERFORMANCE, message, {
      ...context,
      operation,
      duration
    })
  }
}

// シングルトンインスタンスを作成
export const logger = new Logger()

/**
 * API ルート用のログミドルウェア
 */
export function withLogging(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const startTime = Date.now()
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // リクエスト開始ログ
    logger.info(`API Request started`, {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ipAddress: getClientIP(request)
    }, LogCategory.API)

    try {
      const response = await handler(request, { ...context, requestId })
      const duration = Date.now() - startTime
      
      // レスポンス完了ログ
      logger.apiAccess(
        request.method,
        new URL(request.url).pathname,
        response.status,
        duration,
        { requestId }
      )

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      
      // エラーログ
      logger.error(`API Request failed`, error as Error, {
        requestId,
        method: request.method,
        url: request.url,
        duration
      }, LogCategory.API)

      throw error
    }
  }
}

/**
 * セキュリティイベントの便利関数
 */
export const securityEvents = {
  failedLogin: (email: string, ipAddress: string, userAgent?: string) => {
    logger.security({
      type: 'failed_login',
      severity: 'medium',
      description: `Failed login attempt for ${email}`,
      ipAddress,
      userAgent,
      additionalData: { email }
    })
  },

  accountLockout: (email: string, ipAddress: string) => {
    logger.security({
      type: 'account_lockout',
      severity: 'high',
      description: `Account locked due to multiple failed login attempts: ${email}`,
      ipAddress,
      additionalData: { email }
    })
  },

  suspiciousActivity: (description: string, userId?: string, ipAddress?: string) => {
    logger.security({
      type: 'suspicious_activity',
      severity: 'high',
      description,
      userId,
      ipAddress
    })
  },

  unauthorizedAccess: (resource: string, userId?: string, ipAddress?: string) => {
    logger.security({
      type: 'unauthorized_access',
      severity: 'high',
      description: `Unauthorized access attempt to ${resource}`,
      userId,
      ipAddress,
      additionalData: { resource }
    })
  },

  dataAccess: (resource: string, userId: string, ipAddress?: string) => {
    logger.security({
      type: 'data_access',
      severity: 'low',
      description: `User accessed ${resource}`,
      userId,
      ipAddress,
      additionalData: { resource }
    })
  }
}

/**
 * IPアドレス取得ヘルパー関数
 */
function getClientIP(request: Request): string {
  const headers = request.headers
  
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * パフォーマンス測定デコレータ
 */
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  func: T
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now()
    try {
      const result = await func(...args)
      const duration = Date.now() - startTime
      logger.performance(operation, duration)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.performance(`${operation} (failed)`, duration)
      throw error
    }
  }) as T
}

/**
 * ログ設定の動的変更（開発/デバッグ用）
 */
export function setLogLevel(level: LogLevel): void {
  // @ts-ignore - private プロパティへのアクセス
  logger.minLevel = level
}

export default logger 