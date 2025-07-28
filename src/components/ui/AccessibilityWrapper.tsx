"use client"

import { useEffect } from 'react'

interface AccessibilityWrapperProps {
  children: React.ReactNode
}

/**
 * アクセシビリティ機能を統合するラッパーコンポーネント
 */
export default function AccessibilityWrapper({ children }: AccessibilityWrapperProps) {
  useEffect(() => {
    // キーボードナビゲーションの視覚的フィードバック
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tabキーでのフォーカス時にアウトラインを表示
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      // マウス操作時はアウトラインを非表示
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  useEffect(() => {
    // スキップリンクの追加
    const skipLink = document.getElementById('skip-to-main')
    if (!skipLink) {
      const link = document.createElement('a')
      link.id = 'skip-to-main'
      link.href = '#main-content'
      link.textContent = 'メインコンテンツにスキップ'
      link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
      
      // bodyの最初の子要素として追加
      document.body.insertBefore(link, document.body.firstChild)
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        /* キーボードナビゲーション時のみアウトラインを表示 */
        .keyboard-navigation *:focus {
          outline: 2px solid #4f46e5 !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-navigation button:focus,
        .keyboard-navigation a:focus,
        .keyboard-navigation input:focus,
        .keyboard-navigation textarea:focus,
        .keyboard-navigation select:focus {
          outline: 2px solid #4f46e5 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 2px #4f46e5 !important;
        }
        
        /* マウス操作時はアウトラインを非表示 */
        body:not(.keyboard-navigation) *:focus {
          outline: none;
        }
        
        /* スクリーンリーダー専用コンテンツ */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .focus\\:not-sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
        
        /* コントラスト改善 */
        .high-contrast {
          filter: contrast(150%);
        }
        
        /* フォントサイズ調整 */
        .large-text {
          font-size: 1.125em;
        }
        
        .large-text h1 { font-size: 2.5em; }
        .large-text h2 { font-size: 2em; }
        .large-text h3 { font-size: 1.75em; }
        .large-text h4 { font-size: 1.5em; }
        .large-text h5 { font-size: 1.25em; }
        .large-text h6 { font-size: 1.125em; }
        
        /* モーション減少対応 */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        
        /* ダークモード対応の準備 */
        @media (prefers-color-scheme: dark) {
          /* 必要に応じてダークモードスタイルを追加 */
        }
      `}</style>
      
      {/* ARIAライブリージョン（通知用） */}
      <div
        id="aria-live-polite"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      <div
        id="aria-live-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      
      {children}
    </>
  )
}

/**
 * スクリーンリーダー用の通知を送信するヘルパー関数
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const region = document.getElementById(`aria-live-${priority}`)
  if (region) {
    region.textContent = message
    // メッセージをクリアして次の通知に備える
    setTimeout(() => {
      region.textContent = ''
    }, 1000)
  }
}

/**
 * フォーカストラップ用のフック
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ESCキーでフォーカストラップを解除する処理
        // 実装は使用箇所に依存
      }
    }

    document.addEventListener('keydown', trapFocus)
    document.addEventListener('keydown', handleEscape)
    
    // 初期フォーカス
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      document.removeEventListener('keydown', trapFocus)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isActive])
}

/**
 * キーボードナビゲーション用のボタンコンポーネント
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function AccessibleButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: AccessibleButtonProps) {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button 
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  )
} 