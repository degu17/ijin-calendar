import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * NextAuth.js認証ミドルウェア
 * 
 * 【学習ポイント】ミドルウェアの動作フロー
 * 1. ユーザーがページにアクセス
 * 2. ミドルウェアが先に実行される
 * 3. セッション（ログイン状態）をチェック
 * 4. ログイン済み → ページ表示
 * 5. 未ログイン → ログインページにリダイレクト
 */

export default withAuth(
  /**
   * 認証済みユーザーに対して実行される処理
   * @param req リクエストオブジェクト
   */
  function middleware(req) {
    // 認証済みユーザーのみここが実行される
    console.log("認証済みアクセス:", req.nextUrl.pathname)
    
    // 必要に応じて追加の権限チェックもここで実装可能
    // 例：管理者のみアクセス可能なページ、有料プランユーザーのみなど
  },
  {
    /**
     * 認証チェックのロジック
     */
    callbacks: {
      /**
       * アクセス許可判定
       * @param param0 トークン情報
       * @returns true: アクセス許可, false: リダイレクト
       */
      authorized: ({ token, req }) => {
        const { pathname, search } = req.nextUrl
        
        // 【学習ポイント】tokenの中身
        // token = ログイン情報（ユーザーID、メール、名前など）
        // token が存在する = ログイン済み
        // token が null = 未ログイン
        
        const isLoggedIn = !!token
        const isApiRoute = pathname.startsWith('/api/')
        
        console.log("アクセス先:", pathname)
        console.log("ログイン状態:", isLoggedIn ? "ログイン済み" : "未ログイン")
        
        // ログイン済みならアクセス許可
        if (isLoggedIn) {
          return true
        }
        
        // 未ログインの場合
        if (isApiRoute) {
          // API ルートの場合は認証エラーを返す（リダイレクトではなく）
          console.log("未認証API アクセス:", pathname)
          return false
        } else {
          // 通常ページの場合は SessionRequired エラーでリダイレクト
          console.log("未認証ページアクセス - リダイレクト:", pathname)
          return false
        }
      }
    },
    
    /**
     * 認証関連ページの設定
     */
    pages: {
      signIn: "/auth/signin?error=SessionRequired", // セッション切れエラーでリダイレクト
    }
  }
)

/**
 * ミドルウェアを適用するパスの設定
 * 
 * 【重要】matcher で指定したパスのみがミドルウェアの対象
 * 正規表現も使用可能
 */
export const config = {
  matcher: [
    /**
     * 認証が必要なページ一覧
     */
    "/dashboard/:path*",      // /dashboard とその配下全て
    "/api/user/:path*",       // ユーザー情報関連API
    "/api/great-people/:path*", // 偉人データ関連API（ユーザー進捗含む）
    
    /**
     * 【学習ポイント】パスパターンの説明
     * - /dashboard → /dashboard ページのみ
     * - /dashboard/:path* → /dashboard 配下全て（/dashboard/history等）
     * - /api/user/:path* → /api/user 配下の全API
     */
  ]
} 