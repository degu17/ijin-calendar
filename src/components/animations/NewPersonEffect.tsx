"use client"

import { useState, useEffect } from "react"

interface NewPersonEffectProps {
  isTriggered: boolean
  personName?: string
  onEffectComplete?: () => void
}

export default function NewPersonEffect({ 
  isTriggered, 
  personName = "新しい偉人",
  onEffectComplete 
}: NewPersonEffectProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [phase, setPhase] = useState<'enter' | 'stay' | 'exit'>('enter')

  useEffect(() => {
    if (isTriggered) {
      setIsVisible(true)
      setPhase('enter')

      // エンターフェーズ（フェードイン）
      const enterTimer = setTimeout(() => {
        setPhase('stay')
      }, 500)

      // ステイフェーズ（表示継続）
      const stayTimer = setTimeout(() => {
        setPhase('exit')
      }, 2500)

      // エグジットフェーズ（フェードアウト）
      const exitTimer = setTimeout(() => {
        setIsVisible(false)
        onEffectComplete?.()
      }, 3500)

      return () => {
        clearTimeout(enterTimer)
        clearTimeout(stayTimer)
        clearTimeout(exitTimer)
      }
    }
  }, [isTriggered, onEffectComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none">
      {/* オーバーレイ背景 */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          phase === 'enter' ? 'opacity-0' : phase === 'stay' ? 'opacity-30' : 'opacity-0'
        }`}
      />
      
      {/* メインエフェクト */}
      <div 
        className={`relative z-10 text-center transition-all duration-500 transform ${
          phase === 'enter' ? 'scale-50 opacity-0' : 
          phase === 'stay' ? 'scale-100 opacity-100' : 
          'scale-110 opacity-0'
        }`}
      >
        {/* 輝きエフェクト */}
        <div className="relative">
          {/* 外側の輝き */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              phase === 'stay' ? 'animate-ping' : ''
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
              width: '300px',
              height: '300px',
              margin: '-75px',
            }}
          />
          
          {/* 中央のカード */}
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 mx-4 border-2 border-indigo-200">
            {/* 星とスパークルアニメーション */}
            <div className="relative mb-4">
              <div className="text-6xl animate-bounce">⭐</div>
              <div className="absolute -top-2 -left-2 text-2xl animate-pulse text-yellow-400">✨</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-pulse text-yellow-400 animation-delay-300">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse text-yellow-400 animation-delay-600">✨</div>
              <div className="absolute -bottom-2 -right-2 text-2xl animate-pulse text-yellow-400 animation-delay-900">✨</div>
            </div>
            
            {/* メッセージ */}
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">
              🎉 素晴らしい出会い！
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              {personName}が登場しました
            </p>
            <p className="text-lg text-indigo-500 font-medium">
              今日も新しい知恵に触れて
              <br />
              素晴らしい一日を！
            </p>
            
            {/* 装飾的な要素 */}
            <div className="mt-4 flex justify-center space-x-2">
              <span className="text-2xl animate-bounce animation-delay-200">🌟</span>
              <span className="text-2xl animate-bounce animation-delay-400">💫</span>
              <span className="text-2xl animate-bounce animation-delay-600">🌟</span>
            </div>
          </div>
        </div>
      </div>

      {/* カスタムCSS for animation delays */}
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
      `}</style>
    </div>
  )
} 