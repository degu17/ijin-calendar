"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  className?: string
  onMidnight?: () => void
}

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ className = "", onMidnight }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 })
  const [isNearMidnight, setIsNearMidnight] = useState(false)

  const calculateTimeUntilMidnight = (): TimeLeft => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0) // 次の0時

    const diff = midnight.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds }
  }

  useEffect(() => {
    const updateCountdown = () => {
      const newTimeLeft = calculateTimeUntilMidnight()
      setTimeLeft(newTimeLeft)

      // 0時になった場合の処理
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onMidnight?.()
      }

      // 残り1分以内の場合は特別表示
      setIsNearMidnight(newTimeLeft.hours === 0 && newTimeLeft.minutes === 0)
    }

    // 初回実行
    updateCountdown()

    // 1秒ごとに更新
    const interval = setInterval(updateCountdown, 1000)

    // クリーンアップ
    return () => clearInterval(interval)
  }, [onMidnight])

  const formatTime = (time: TimeLeft): string => {
    if (time.hours > 0) {
      return `${time.hours}時間${time.minutes}分`
    } else if (time.minutes > 0) {
      return `${time.minutes}分${time.seconds}秒`
    } else {
      return `${time.seconds}秒`
    }
  }

  return (
    <div className={`text-center ${className}`}>
      <p className={`text-xs font-medium transition-colors duration-300 ${
        isNearMidnight 
          ? 'text-yellow-600 animate-pulse' 
          : 'text-indigo-600'
      }`}>
        {isNearMidnight ? (
          <>
            🌟 まもなく新しい偉人が登場！
            <br />
            あと {formatTime(timeLeft)}
          </>
        ) : (
          <>
            明日の偉人まで
            <br />
            あと {formatTime(timeLeft)}
          </>
        )}
      </p>
      
      {isNearMidnight && (
        <div className="mt-2 text-xs text-yellow-500 animate-bounce">
          ✨ お楽しみに！
        </div>
      )}
    </div>
  )
} 