// 查询任务状态 API
import { NextRequest, NextResponse } from 'next/server'

// 导入任务结果存储（与回调共享）
import taskResultsStore from '@/lib/task-results-store'

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId')
  
  if (!taskId) {
    return NextResponse.json(
      { error: '缺少 taskId 参数' },
      { status: 400 }
    )
  }

  console.log('[check-task] Checking status for taskId:', taskId)

  // 从内存中查询结果
  const result = taskResultsStore.get(taskId)
  
  if (!result) {
    console.log('[check-task] Task not found or still processing')
    return NextResponse.json({
      status: 'processing',
      message: '图片生成中...',
    })
  }

  console.log('[check-task] Task result found:', result.code, result.msg)

  // 检查任务状态
  if (result.code === 200) {
    const imageUrl = result.data?.info?.resultImageUrl
    
    if (!imageUrl) {
      return NextResponse.json({
        error: '图片 URL 不存在',
      }, { status: 500 })
    }

    console.log('[check-task] ✅ Task completed successfully')
    console.log('[check-task] 🖼️  Image URL:', imageUrl)

    // 下载图片并转为 base64
    try {
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(imageBuffer).toString('base64')

      console.log('[check-task] ✅ Image downloaded and converted')

      // 清除已使用的结果
      taskResultsStore.delete(taskId)

      return NextResponse.json({
        success: true,
        images: [{
          base64: base64Image,
          mediaType: 'image/jpeg',
        }],
      })
    } catch (error) {
      console.error('[check-task] ❌ Failed to download image:', error)
      return NextResponse.json({
        error: '图片下载失败',
      }, { status: 500 })
    }
  } else {
    // 任务失败
    console.error('[check-task] ❌ Task failed:', result.msg)
    
    // 清除失败的结果
    taskResultsStore.delete(taskId)

    let errorMessage = '图片生成失败'
    if (result.code === 400) {
      errorMessage = '内容违规，请调整祝福语'
    } else if (result.code === 500) {
      errorMessage = '服务器错误，请稍后重试'
    } else if (result.code === 501) {
      errorMessage = '生成任务失败，请重试'
    } else {
      errorMessage = result.msg || '未知错误'
    }

    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 })
  }
}
