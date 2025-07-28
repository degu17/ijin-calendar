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
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params

    // 日付形式チェック（MM-DD または YYYY-MM-DD）
    const dateRegex = /^(\d{4}-)?(\d{2})-(\d{2})$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { 
          success: false,
          message: "日付形式が正しくありません。MM-DD または YYYY-MM-DD 形式で指定してください。" 
        },
        { status: 400 }
      )
    }

    // 偉人データファイルを読み込み
    const filePath = join(process.cwd(), "src/data/great-people.json")
    const fileContents = readFileSync(filePath, "utf8")
    const greatPeopleData = JSON.parse(fileContents)
    const people = greatPeopleData.people || []

    if (people.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: "偉人データが見つかりません" 
        },
        { status: 404 }
      )
    }

    // 日付から偉人を決定するロジック
    // 簡易実装: 月日を数値に変換して偉人配列のインデックスを決定
    const [, year, month, day] = date.match(dateRegex) || []
    const monthNum = parseInt(month)
    const dayNum = parseInt(day)
    
    // 月日から一意のハッシュ値を生成（1年365日に対応）
    const dayOfYear = (monthNum - 1) * 31 + dayNum  // 簡易計算
    const personIndex = dayOfYear % people.length   // 偉人配列のサイズで割った余り
    
    const selectedPerson = people[personIndex]
    
    if (!selectedPerson) {
      return NextResponse.json(
        { 
          success: false,
          message: `${date}の偉人データが見つかりません` 
        },
        { status: 404 }
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      data: selectedPerson,
      meta: {
        date: date,
        dayOfYear: dayOfYear,
        personIndex: personIndex,
        totalPeople: people.length
      }
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