import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * 偉人データ取得API
 * 
 * GET /api/great-people - 全ての偉人データを取得
 * GET /api/great-people?date=MM-DD - 指定日の偉人データを取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    // 偉人データファイルを読み込み
    const filePath = join(process.cwd(), "src/data/great-people.json")
    const fileContents = readFileSync(filePath, "utf8")
    const greatPeopleFile = JSON.parse(fileContents)
    const greatPeopleData = greatPeopleFile.people || []

    // 日付指定がある場合（今は実装中なので全データから最初の項目を返す）
    if (dateParam) {
      // TODO: 日付ベースの検索実装
      const sampleData = greatPeopleData[0] || null
      
      if (!sampleData) {
        return NextResponse.json(
          { message: "指定された日付の偉人データが見つかりません" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: sampleData,
      })
    }

    // 全データを返す
    return NextResponse.json({
      success: true,
      data: greatPeopleData,
      count: greatPeopleData.length,
      version: greatPeopleFile.version,
      lastUpdated: greatPeopleFile.lastUpdated,
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