// 文案生成 API - 根据主题+用户输入生成结构化祝福文案
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BLESSING_THEMES } from '@/lib/types'

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { themeId, userInput } = body

    console.log('[generate-text] ============ 请求参数 ============')
    console.log('[generate-text] themeId:', themeId)
    console.log('[generate-text] userInput:', userInput, `(${userInput?.length || 0}字)`)
    console.log('[generate-text] ========================================')

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

    console.log('[generate-text] 主题名称:', theme.name, `(${theme.nameEn})`)

    const prompt = `你是一位专业的祝福文案和视觉设计师。请根据以下信息生成精美的祝福内容：

主题：${theme.name}（${theme.nameEn}）
主题描述：${theme.description}
用户输入的祝福内容：${userInput}

请生成结构化的祝福内容，包含文案和配套的视觉装饰元素。

请直接返回 JSON 格式（不要用 markdown 代码块包裹）：
{
  "title": "祝福卡片的标题，简洁有力，5-8个字",
  "mainText": "主要祝福语，温暖感人，必须严格控制在20字以内（包括标点符号）",
  "subtitle": "副标题或落款语，8-12个字",
  "visualElements": "根据主题创造性地生成5-10个适合的视觉装饰元素，用逗号分隔。不限字数。"
}

visualElements 设计要求：
1. 必须包含三类元素，搭配和谐：
   - 主题图案（2-4个）：与主题直接相关的核心图案
     例如：生日主题可以有小蛋糕、蜡烛、气球、礼物盒等
   - 特殊元素（1-3个）：增添喜庆或祝福感的元素
     例如：红包、元宝、金条、钞票雨、招财猫、金币、钻石等
   - 装饰线条（2-3个）：点缀和美化的细节
     例如：波浪线、虚线、闪光点、小花朵、箭头、星星点、爱心点缀等

2. 元素要符合主题氛围，可爱易于辨认
3. 可以根据具体祝福内容灵活调整和创新
4. 元素名称要简洁明了，易于理解

重要规则：
- mainText 的字数必须严格限制在 20 字以内！
- visualElements 不限字数，充分发挥创意
- 确保整体风格统一、美观大方`

    // 使用 Gemini 生成文案
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log('[generate-text] ============ LLM 生成结果 ============')
    console.log('[generate-text] 原始响应长度:', text.length, 'characters')
    console.log('[generate-text] 原始响应内容:')
    console.log(text)
    console.log('[generate-text] ========================================')

    // 解析 JSON 响应
    let object
    try {
      // 尝试直接解析
      object = JSON.parse(text)
    } catch {
      // 如果失败，尝试清理并提取 JSON
      console.log('[generate-text] Raw response:', text) // 调试用
      
      // 移除可能的 markdown 代码块
      let cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      try {
        object = JSON.parse(cleanedText)
      } catch {
        // 尝试提取 JSON 对象
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            object = JSON.parse(jsonMatch[0])
          } catch (e) {
            console.error('[generate-text] Failed to parse JSON:', jsonMatch[0])
            throw new Error('无法解析 AI 响应格式')
          }
        } else {
          console.error('[generate-text] No JSON found in response:', text)
          throw new Error('AI 响应中未找到有效 JSON')
        }
      }
    }

    // 验证必需字段
    if (!object.title || !object.mainText || !object.subtitle || !object.visualElements) {
      console.error('[generate-text] 缺少必需字段:', {
        hasTitle: !!object.title,
        hasMainText: !!object.mainText,
        hasSubtitle: !!object.subtitle,
        hasVisualElements: !!object.visualElements
      })
      throw new Error('AI 响应格式不完整')
    }

    // 严格限制 mainText 长度为 20 字
    if (object.mainText.length > 20) {
      console.log('[generate-text] mainText 超过 20 字，原始长度:', object.mainText.length)
      object.mainText = object.mainText.slice(0, 20)
    }

    console.log('[generate-text] ============ 解析后的结果 ============')
    console.log('[generate-text] title:', object.title)
    console.log('[generate-text] mainText:', object.mainText, `(${object.mainText.length}字)`)
    console.log('[generate-text] subtitle:', object.subtitle)
    console.log('[generate-text] visualElements:', object.visualElements)
    console.log('[generate-text] ========================================')

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
