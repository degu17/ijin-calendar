import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * 相対日付による偉人データ取得API
 * 
 * GET /api/great-people/relative/-1 - 昨日の偉人データを取得
 * GET /api/great-people/relative/0  - 今日の偉人データを取得
 * GET /api/great-people/relative/1  - 明日の偉人データを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { offset: string } }
) {
  try {
    const { offset } = params

    // オフセット値の検証
    const offsetNum = parseInt(offset)
    if (isNaN(offsetNum) || offsetNum < -365 || offsetNum > 365) {
      return NextResponse.json(
        { 
          success: false,
          message: "オフセット値が正しくありません。-365から365の範囲で指定してください。" 
        },
        { status: 400 }
      )
    }

    // 対象日付を計算
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + offsetNum)
    
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    const dateString = `${month}-${day}`

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

    // 日付から偉人を決定するロジック（[date]/route.tsと同じ）
    const monthNum = parseInt(month)
    const dayNum = parseInt(day)
    
    // 月日から一意のハッシュ値を生成
    const dayOfYear = (monthNum - 1) * 31 + dayNum
    const personIndex = dayOfYear % people.length
    
    const selectedPerson = people[personIndex]

    // 明日の場合は制限されたヒント情報のみ返す
    if (offsetNum > 0) {
      const hint = generateTomorrowHint(selectedPerson)
      return NextResponse.json({
        success: true,
        data: {
          hint: hint,
          category: selectedPerson.profession.split('・')[0], // 最初の職業のみ
          isPreview: true
        },
        meta: {
          date: dateString,
          offset: offsetNum,
          message: "明日の偉人の詳細情報は明日をお楽しみに！"
        }
      })
    }

    // 昨日・今日の場合は完全な情報を返す
    return NextResponse.json({
      success: true,
      data: selectedPerson,
      meta: {
        date: dateString,
        offset: offsetNum,
        dayOfYear: dayOfYear,
        personIndex: personIndex,
        totalPeople: people.length
      }
    })

  } catch (error) {
    console.error("相対日付偉人データ取得エラー:", error)
    
    return NextResponse.json(
      { 
        success: false,
        message: "偉人データの取得に失敗しました" 
      },
      { status: 500 }
    )
  }
}

/**
 * 明日の偉人のヒントを生成する関数
 */
function generateTomorrowHint(person: any): string {
  const profession = person.profession
  const birthYear = person.birthYear
  
  // 時代を判定
  let era = ""
  if (birthYear < 1500) {
    era = "古典時代"
  } else if (birthYear < 1800) {
    era = "近世"
  } else if (birthYear < 1900) {
    era = "19世紀"
  } else {
    era = "現代"
  }
  
  // 職業カテゴリを判定
  let category = ""
  if (profession.includes("科学") || profession.includes("物理") || profession.includes("化学")) {
    category = "科学者"
  } else if (profession.includes("画家") || profession.includes("芸術")) {
    category = "芸術家"
  } else if (profession.includes("発明")) {
    category = "発明家"
  } else {
    category = profession.split('・')[0] // 最初の職業
  }
  
  const hints = [
    `明日は${era}の${category}が登場`,
    `${category}として活躍した偉人が明日のゲスト`,
    `${era}に生きた偉大な${category}をお楽しみに`,
  ]
  
  return hints[Math.floor(Math.random() * hints.length)]
} 