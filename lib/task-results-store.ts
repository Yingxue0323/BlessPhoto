// Vercel KV (Upstash Redis) 存储：存储 NanoBanana 回调的任务结果
// 用于在回调 API 和查询 API 之间共享数据（跨 Serverless 实例）

import { kv } from '@vercel/kv'

interface TaskResult {
  code: number
  msg: string
  data: any
  timestamp: number
}

class TaskResultsStore {
  private readonly prefix = 'task:'
  private readonly ttl = 60 * 60 // 1 小时 TTL

  async set(taskId: string, result: Omit<TaskResult, 'timestamp'>): Promise<void> {
    const key = `${this.prefix}${taskId}`
    const value: TaskResult = {
      ...result,
      timestamp: Date.now()
    }
    
    // 使用 Upstash Redis (Vercel KV) 存储，自动过期
    await kv.setex(key, this.ttl, JSON.stringify(value))
    console.log('[task-store] ✅ Stored result for taskId:', taskId)
  }

  async get(taskId: string): Promise<TaskResult | null> {
    const key = `${this.prefix}${taskId}`
    const value = await kv.get<string>(key)
    
    if (!value) {
      return null
    }

    try {
      return JSON.parse(value) as TaskResult
    } catch (error) {
      console.error('[task-store] Failed to parse result:', error)
      return null
    }
  }

  async delete(taskId: string): Promise<void> {
    const key = `${this.prefix}${taskId}`
    await kv.del(key)
    console.log('[task-store] 🗑️  Deleted result for taskId:', taskId)
  }

  // 获取所有任务数量（可选，调试用）
  async size(): Promise<number> {
    try {
      const keys = await kv.keys(`${this.prefix}*`)
      return keys.length
    } catch {
      return 0
    }
  }
}

// 导出单例
const taskResultsStore = new TaskResultsStore()
export default taskResultsStore
