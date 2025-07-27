import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * 指定日付の偉人データ取得API
 * 
 * GET /api/great-people/01-01 - 1月1日の偉人データを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params

    // 日付形式チェック（MM-DD）
    const dateRegex = /^\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { 
          success: false,
          message: "日付形式が正しくありません。MM-DD形式で指定してください。" 
        },
        { status: 400 }
      )
    }

    // 偉人データファイルを読み込み
    const filePath = join(process.cwd(), "src/data/great-people.json")
    const fileContents = readFileSync(filePath, "utf8")
    const greatPeopleData = JSON.parse(fileContents)

    // 指定日付のデータを検索
    const dateData = greatPeopleData.find((person: any) => person.date === date)
    
    if (!dateData) {
      return NextResponse.json(
        { 
          success: false,
          message: `${date}の偉人データが見つかりません` 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dateData,
    })

  } catch (error) {
    console.error("偉人データ取得エラー:", error)
    
    return NextResponse.json(
      { 
        success: false,
        message: "偉人データの取得に失敗しました" 
      },
      { status: 500 }
    )
  }
} 