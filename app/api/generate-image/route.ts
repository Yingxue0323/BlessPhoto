import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { theme, userBlessing } = await req.json();
    
    // 验证必填参数
    if (!userBlessing || !theme) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 主题风格映射
    const themeStyles: Record<string, string> = {
      birthday: '温馨浪漫的生日庆祝场景,蛋糕、气球、彩带',
      wedding: '梦幻唯美的婚礼场景,鲜花、拱门、浪漫氛围',
      graduation: '青春活力的毕业场景,学士帽、证书、阳光、钞票',
      newYear: '喜庆热闹的新年场景,红色主调、灯笼、烟花',
      anniversary: '温馨浪漫的纪念场景,玫瑰、香槟、烛光',
      baby: '可爱温柔的新生儿场景,柔和色彩、玩具、星星',
      promotion: '专业大气的职场场景,奖杯、证书、都市背景、钞票',
      recovery: '温暖治愈的康复场景,阳光、绿植、柔和色调'
    };

    // 选择模型(Flash 最便宜)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview", 
    });
    
    // 构建提示词
    const systemPrompt = `你是一个专业的AI绘画提示词生成专家。

任务: 根据用户的祝福语,生成一个适合AI绘画的英文提示词。

用户祝福主题: ${theme}
用户祝福内容: ${userBlessing}
场景风格参考: ${themeStyles[theme] || '温馨美好的场景'}

要求:
1. 提示词必须是英文
2. 包含具体的视觉元素(人物、物品、场景、色彩)
3. 包含艺术风格描述(如: watercolor painting, digital art, photorealistic)
4. 长度控制在50-100词
5. 避免抽象概念,只描述可视化内容
6. 融合用户祝福语的核心情感和关键元素
7. 添加画质提升词: high quality, 4k, detailed

输出格式: 只输出提示词本身,不要任何解释、引号或前缀。

示例:
A heartwarming birthday celebration scene with a beautifully decorated cake surrounded by colorful balloons and confetti, warm golden lighting, soft pastel colors, digital art style, joyful and festive atmosphere, depth of field, high quality, 4k

现在请生成:`;

    // 调用 Gemini API
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const generatedPrompt = response.text().trim();

    // 清理可能的多余字符
    const cleanedPrompt = generatedPrompt
      .replace(/^["']|["']$/g, '') // 移除首尾引号
      .replace(/\n/g, ' ') // 移除换行
      .trim();

    console.log('Generated prompt:', cleanedPrompt); // 调试用

    return NextResponse.json({
      success: true,
      prompt: cleanedPrompt,
      userBlessing,
      theme
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // 处理常见错误
    let errorMessage = '文案生成失败';
    if (error.message?.includes('API_KEY')) {
      errorMessage = 'API Key 配置错误';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API 配额已用完';
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}