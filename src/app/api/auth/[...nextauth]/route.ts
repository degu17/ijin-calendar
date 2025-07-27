import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth.js APIハンドラー
 * 
 * 【学習ポイント】このファイルが作る認証エンドポイント：
 * - GET/POST /api/auth/signin - ログイン処理
 * - GET/POST /api/auth/signout - ログアウト処理  
 * - GET/POST /api/auth/callback - OAuth認証後のコールバック
 * - GET /api/auth/session - 現在のセッション情報取得
 * - GET /api/auth/providers - 使用可能な認証プロバイダー一覧
 * - GET /api/auth/csrf - CSRF対策トークン取得
 */

// NextAuth.jsハンドラーを作成
const handler = NextAuth(authOptions)

/**
 * 【重要】Next.js App Routerでは、HTTPメソッドごとにexportが必要
 * 
 * なぜGETとPOSTの両方？
 * - GET: ログインページの表示、セッション情報取得など
 * - POST: 実際のログイン・ログアウト処理など
 */

// GETリクエスト用（ページ表示、情報取得）
export { handler as GET }

// POSTリクエスト用（認証処理、ログイン・ログアウト）
export { handler as POST } 