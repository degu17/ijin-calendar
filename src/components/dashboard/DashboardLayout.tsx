"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Tooltip from "../ui/Tooltip"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "ダッシュボード", href: "/dashboard", icon: "🏠" },
    { name: "進捗", href: "/dashboard/progress", icon: "📊" },
    { name: "設定", href: "/dashboard/settings", icon: "⚙️" },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Compact Icon-only Sidebar */}
      <nav 
        className={`fixed inset-y-0 left-0 z-50 w-12 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="メインナビゲーション"
        aria-hidden={!sidebarOpen}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 bg-indigo-600 flex items-center justify-center flex-shrink-0 relative">
            <span className="text-white text-lg">📅</span>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute -top-1 -right-1 p-1 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-700"
            >
              <span className="sr-only">サイドバーを閉じる</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Icons */}
          <div className="flex-1 py-4 space-y-3 overflow-y-auto" role="menu">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip content={item.name} side="right" key={item.name}>
                <Link
                  href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`block p-2 mx-1 rounded-md text-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                    aria-label={item.name}
                >
                    <span className="text-lg">{item.icon}</span>
                </Link>
                </Tooltip>
              )
            })}
          </div>

          {/* User Avatar */}
          <div className="p-2 border-t border-gray-200 flex-shrink-0">
            <Tooltip 
              content={`${session?.user?.name} - ログアウト`} 
              side="right"
            >
            <button
              onClick={handleSignOut}
                className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mx-auto hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                aria-label="ログアウト"
            >
                <span className="text-white text-sm font-bold">
                  {session?.user?.name?.charAt(0) || "U"}
                </span>
            </button>
            </Tooltip>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center px-4 py-3 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">サイドバーを開く</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main 
          id="main-content" 
          className="flex-1 overflow-y-auto"
          role="main"
          aria-label="メインコンテンツ"
        >
          <div className="h-full mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 py-3 lg:py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 