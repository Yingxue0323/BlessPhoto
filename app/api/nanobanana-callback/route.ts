// NanoBanana 图片生成回调接收端点
import { NextRequest, NextResponse } from 'next/server'
import taskResultsStore from '@/lib/task-results-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, msg, data } = body
    const taskId = data?.taskId

    console.log('[nanobanana-callback] ========================================')
    console.log('[nanobanana-callback] Received callback for taskId:', taskId)
    console.log('[nanobanana-callback] Status code:', code)
    console.log('[nanobanana-callback] Message:', msg)
    console.log('[nanobanana-callback] Full data:', JSON.stringify(data))
    console.log('[nanobanana-callback] ========================================')

    if (!taskId) {
      return NextResponse.json({ status: 'error', message: 'Missing taskId' }, { status: 400 })
    }

    // 存储结果到共享存储
    taskResultsStore.set(taskId, {
      code,
      msg,
      data
    })

    // 处理不同状态
    if (code === 200) {
      console.log('[nanobanana-callback] ✅ Task completed successfully!')
      console.log('[nanobanana-callback] Image URL:', data.info?.resultImageUrl)
    } else if (code === 400) {
      console.log('[nanobanana-callback] ❌ Content policy violation')
    } else if (code === 500) {
      console.log('[nanobanana-callback] ❌ Internal error')
    } else if (code === 501) {
      console.log('[nanobanana-callback] ❌ Generation failed')
    }

    // 返回 200 确认收到
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('[nanobanana-callback] Error processing callback:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

// 查询任务结果的 GET 端点（已废弃，使用 /api/check-task 代替）
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId')
  
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
  }

  const result = taskResultsStore.get(taskId)
  
  if (!result) {
    return NextResponse.json({ status: 'pending' }, { status: 404 })
  }

  return NextResponse.json(result, { status: 200 })
}
