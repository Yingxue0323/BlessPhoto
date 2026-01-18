// 文案生成 API - 根据主题+用户输入生成结构化祝福文案
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BLESSING_THEMES } from '@/lib/types'

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { themeId, userInput } = body

    if (!themeId || !userInput) {
      return Response.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const theme = BLESSING_THEMES.find(t => t.id === themeId)
    if (!theme) {
      return Response.json(
        { error: '无效的主题' },
        { status: 400 }
      )
    }

    const prompt = `你是一位专业的祝福文案撰写师。请根据以下信息生成一段精美的祝福文案：

主题：${theme.name}（${theme.nameEn}）
主题描述：${theme.description}
用户输入的祝福内容：${userInput}

请生成结构化的祝福文案，包含标题、主要祝福语和副标题/落款。
文案要温暖感人，符合${theme.name}的氛围，使用优美的中文表达。
注意：保持文案简洁精炼，适合制作成祝福卡片。

请直接返回 JSON 格式（不要用 markdown 代码块包裹）：
{
  "title": "祝福卡片的标题，简洁有力，5-10个字",
  "mainText": "主要祝福语，温暖感人，20-50个字",
  "subtitle": "副标题或落款语，10-20个字"
}`

    // 使用 Gemini 生成文案
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 解析 JSON 响应
    let object
    try {
      // 尝试直接解析
      object = JSON.parse(text)
    } catch {
      // 如果失败，尝试提取 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        object = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析 AI 响应')
      }
    }

    // 验证必需字段
    if (!object.title || !object.mainText || !object.subtitle) {
      throw new Error('AI 响应格式不完整')
    }

    return Response.json({
      success: true,
      text: object,
    })
  } catch (error: any) {
    console.error('[generate-text] Error:', error)
    
    let errorMessage = '文案生成失败，请重试'
    if (error.message?.includes('API_KEY')) {
      errorMessage = 'API Key 配置错误'
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API 配额已用完'
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
