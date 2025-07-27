import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { authenticateUser } from "./user-service"

/**
 * NextAuth.jsの設定オブジェクト
 * 認証の動作を細かく制御できる
 */
export const authOptions: NextAuthOptions = {
  // Prismaアダプター: NextAuth.jsとデータベースを連携
  adapter: PrismaAdapter(prisma),
  
  // セッション管理方式
  session: {
    // "jwt": JWTトークンでセッション管理（軽量、ステートレス）
    // "database": データベースでセッション管理（より安全、情報多い）
    strategy: "database", // Prismaを使うのでdatabase方式
  },
  
  // 認証プロバイダー
  providers: [
    /**
     * Email/Password認証プロバイダー
     * 
     * 【学習ポイント】CredentialsProviderの仕組み
     * 1. ログインフォームの定義（email, password）
     * 2. authorize関数で認証ロジック実行
     * 3. 成功時：ユーザー情報を返す → ログイン成功
     * 4. 失敗時：null を返す → ログイン失敗
     */
    CredentialsProvider({
      id: "credentials",
      name: "メールアドレス", // ログイン画面に表示される名前
      credentials: {
        email: {
          label: "メールアドレス",
          type: "email",
          placeholder: "your-email@example.com"
        },
        password: {
          label: "パスワード",
          type: "password",
          placeholder: "パスワードを入力"
        }
      },
      /**
       * 認証処理の中核
       * @param credentials ユーザーが入力したメール・パスワード
       * @returns ユーザー情報 or null
       */
      async authorize(credentials) {
        // 入力値チェック
        if (!credentials?.email || !credentials?.password) {
          console.log("認証失敗: メールアドレスまたはパスワードが未入力")
          return null
        }

        try {
          // ユーザー認証を実行
          const user = await authenticateUser(
            credentials.email,
            credentials.password
          )

          if (user) {
            console.log("認証成功:", user.email)
            // NextAuth.jsが期待する形式でユーザー情報を返す
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          } else {
            console.log("認証失敗: 無効なメールアドレスまたはパスワード")
            return null
          }
        } catch (error) {
          console.error("認証エラー:", error)
          return null
        }
             }
     }),

    /**
     * Google OAuth認証プロバイダー
     * 
     * 【学習ポイント】OAuth認証の仕組み
     * 1. ユーザーがGoogleでログインを選択
     * 2. Googleの認証画面にリダイレクト
     * 3. ユーザーがGoogleアカウントで認証
     * 4. Googleからユーザー情報を受け取る
     * 5. 自動的にデータベースに保存（PrismaAdapterが処理）
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      
      /**
       * 【学習ポイント】スコープの説明
       * - profile: ユーザーの名前、写真などの基本情報
       * - email: メールアドレス
       * - openid: OpenID Connect用（必須）
       */
      authorization: {
        params: {
          scope: "openid email profile"
        }
      },
      
      /**
       * 【セキュリティ】プロフィール情報のカスタマイズ
       * Googleから取得した情報を安全に処理
       */
      profile(profile) {
        console.log("Google認証プロフィール:", profile)
        
        return {
          id: profile.sub, // Googleのユーザー一意ID
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  
  // カスタムページ（後で設定）
  pages: {
    signIn: "/auth/signin", // ログインページのパス
  },
  
  // コールバック関数（認証フローの各段階で実行される）
  callbacks: {
    // セッション情報をカスタマイズ
    session: async ({ session, user }) => {
      // フロントエンドに渡すセッション情報を調整
      if (session?.user && user) {
        // 型安全にユーザーIDを追加
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
          },
        };
      }
      return session;
    },
    
    // JWT情報をカスタマイズ（database戦略では使用頻度低い）
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  
  // 開発環境でのデバッグ設定
  debug: process.env.NODE_ENV === "development",
}; 