"use client"

import { useState } from "react"

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export default function Tooltip({ 
  content, 
  children, 
  side = "right",
  className = "" 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2"
  }

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800"
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap ${sideClasses[side]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 ${arrowClasses[side]}`}
          />
        </div>
      )}
    </div>
  )
} 