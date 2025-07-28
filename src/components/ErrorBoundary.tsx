"use client"

import React, { Component, ReactNode } from 'react'
import { logReactError } from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

/**
 * React Error Boundary
 * React コンポーネントでキャッチされていないエラーをキャッチし、
 * フォールバックUIを表示します
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生した場合に state を更新
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーを外部ログサービスに送信
    logReactError(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを表示
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h1 className="text-lg font-semibold text-gray-900">
                エラーが発生しました
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                申し訳ございません。予期しないエラーが発生しました。
                ページを再読み込みするか、しばらく時間をおいて再度お試しください。
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    詳細なエラー情報（開発環境のみ）
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                    <div className="font-semibold mb-2">Error:</div>
                    <div>{this.state.error?.toString()}</div>
                    
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <div className="font-semibold mt-4 mb-2">Component Stack:</div>
                        <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </>
                    )}
                    
                    {this.state.error?.stack && (
                      <>
                        <div className="font-semibold mt-4 mb-2">Stack Trace:</div>
                        <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  再試行
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  ページ再読み込み
                </button>
              </div>

              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  ← ダッシュボードに戻る
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 特定のエラータイプ用のError Boundary
 */
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                データの読み込みに失敗しました
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>ネットワーク接続を確認して、再度お試しください。</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 px-3 py-2 text-sm font-medium text-red-800 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  再読み込み
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary 