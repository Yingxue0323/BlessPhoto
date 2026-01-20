import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, blessingText, userId } = await req.json();

    // 验证必填参数
    if (!imageBase64 || !blessingText) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数：图片或祝福文字' },
        { status: 400 }
      );
    }

    // 验证 API Key
    const apiKey = process.env.NANOBANANA_API_KEY;
    if (!apiKey) {
      console.error('[generate-image] NANOBANANA_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    console.log('[generate-image] Calling NanoBanana API...');
    console.log('[generate-image] Blessing text:', blessingText);
    console.log('[generate-image] Image size:', imageBase64.length, 'bytes');

    // 判断是否在生产环境
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_URL
    const baseUrl = isProduction 
      ? `https://${process.env.VERCEL_URL || 'your-app.vercel.app'}`
      : 'http://localhost:3000'
    
    const callbackUrl = `${baseUrl}/api/nanobanana-callback`
    
    console.log('[generate-image] Environment:', isProduction ? 'Production' : 'Development')
    console.log('[generate-image] Callback URL:', callbackUrl)

    // 调用 NanoBanana API（正确的端点和参数格式）
    const response = await fetch('https://api.nanobananaapi.ai/api/v1/nanobanana/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: blessingText,
        numImages: 1,
        type: 'TEXTTOIAMGE', // 注意：API 文档中就是这个拼写
        image_size: '1:1',
        ...(isProduction && { callBackUrl: callbackUrl }), // 生产环境才提供回调
        // 如果支持输入图片，可能需要添加 image 字段
        // image: imageBase64,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[generate-image] NanoBanana API error:', response.status, errorData);
      
      let errorMessage = '图片生成失败';
      if (response.status === 401) {
        errorMessage = 'API Key 无效';
      } else if (response.status === 429) {
        errorMessage = 'API 调用次数已达上限';
      } else if (response.status === 400) {
        errorMessage = errorData.error || '请求参数错误';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[generate-image] NanoBanana API response:', JSON.stringify(data));

    // NanoBanana 返回格式：{ code: 200, msg: "success", data: { taskId: "..." } }
    if (data.code === 200 && data.data?.taskId) {
      const taskId = data.data.taskId;
      console.log('[generate-image] ✅ Task created successfully!');
      console.log('[generate-image] 📋 Task ID:', taskId);
      console.log('[generate-image] ⏳ Image generation in progress...');
      console.log('[generate-image] 🔔 Waiting for callback from NanoBanana...');

      // 返回任务 ID，让前端知道任务已创建
      // 图片生成完成后，NanoBanana 会回调到 /api/nanobanana-callback
      return NextResponse.json({
        success: true,
        taskId: taskId,
        status: 'processing',
        message: '图片生成中，请稍候...',
      });
    } else {
      // API 返回错误
      console.error('[generate-image] ❌ API error:', data);
      return NextResponse.json({
        success: false,
        error: `API 错误：${data.msg || '未知错误'}`,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[generate-image] Error:', error);
    
    let errorMessage = '图片生成失败';
    if (error.message?.includes('API_KEY')) {
      errorMessage = 'API Key 配置错误';
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'API 连接失败，请检查网络';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}