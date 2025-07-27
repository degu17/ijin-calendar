import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/user-service"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // 入力値検証
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "必須項目が入力されていません" },
        { status: 400 }
      )
    }

    // ユーザー作成
    const newUser = await createUser(email, password, name)

    // パスワードを除いてレスポンス
    return NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("ユーザー登録エラー:", error)

    // エラーメッセージを適切に処理
    const message = error.message || "ユーザー登録に失敗しました"
    const status = error.message?.includes("既に登録") ? 409 : 500

    return NextResponse.json(
      { message },
      { status }
    )
  }
} 