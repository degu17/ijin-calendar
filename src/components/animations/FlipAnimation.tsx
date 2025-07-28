"use client"

import { useState, useEffect, ReactNode } from "react"

interface FlipAnimationProps {
  children: ReactNode
  triggerAnimation: boolean
  onAnimationComplete?: () => void
  className?: string
}

export default function FlipAnimation({ 
  children, 
  triggerAnimation, 
  onAnimationComplete,
  className = ""
}: FlipAnimationProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {
    if (triggerAnimation) {
      // アニメーション開始
      setIsFlipping(true)
      setShowContent(false)

      // アニメーション中間点でコンテンツを切り替え
      const midpoint = setTimeout(() => {
        setShowContent(true)
      }, 300) // アニメーションの半分の時間

      // アニメーション完了
      const complete = setTimeout(() => {
        setIsFlipping(false)
        onAnimationComplete?.()
      }, 600) // 全アニメーション時間

      return () => {
        clearTimeout(midpoint)
        clearTimeout(complete)
      }
    }
  }, [triggerAnimation, onAnimationComplete])

  return (
    <div className={`flip-container ${className}`}>
      <div 
        className={`flip-card ${isFlipping ? 'flipping' : ''}`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div 
          className="flip-card-content"
          style={{
            transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s ease-in-out',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {showContent && children}
        </div>
      </div>

      <style jsx>{`
        .flip-container {
          width: 100%;
          height: 100%;
        }
        
        .flip-card {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .flip-card-content {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .flipping .flip-card-content {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

// 使用例用のラッパーコンポーネント
interface DailyFlipCardProps {
  children: ReactNode
  isNewDay: boolean
  onFlipComplete?: () => void
  className?: string
}

export function DailyFlipCard({ 
  children, 
  isNewDay, 
  onFlipComplete,
  className = ""
}: DailyFlipCardProps) {
  const [flipTrigger, setFlipTrigger] = useState(false)

  useEffect(() => {
    if (isNewDay) {
      setFlipTrigger(true)
      // リセット用のタイマー
      const reset = setTimeout(() => {
        setFlipTrigger(false)
      }, 700)
      
      return () => clearTimeout(reset)
    }
  }, [isNewDay])

  return (
    <FlipAnimation
      triggerAnimation={flipTrigger}
      onAnimationComplete={onFlipComplete}
      className={className}
    >
      {children}
    </FlipAnimation>
  )
} 