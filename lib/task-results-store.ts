// 任务结果存储（内存）- 用于回调和查询共享数据
// 生产环境应该用 Redis 或数据库

interface TaskResult {
  code: number
  msg: string
  data: any
  timestamp: number
}

class TaskResultsStore {
  private store: Map<string, TaskResult>

  constructor() {
    this.store = new Map()
    
    // 定期清理过期结果（1小时）
    setInterval(() => this.cleanup(), 60 * 60 * 1000)
  }

  set(taskId: string, result: Omit<TaskResult, 'timestamp'>) {
    this.store.set(taskId, {
      ...result,
      timestamp: Date.now()
    })
  }

  get(taskId: string): TaskResult | undefined {
    return this.store.get(taskId)
  }

  delete(taskId: string) {
    this.store.delete(taskId)
  }

  cleanup() {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 小时
    
    for (const [taskId, result] of this.store.entries()) {
      if (now - result.timestamp > maxAge) {
        this.store.delete(taskId)
        console.log('[task-store] Cleaned up expired task:', taskId)
      }
    }
  }

  size() {
    return this.store.size
  }
}

// 导出单例
const taskResultsStore = new TaskResultsStore()
export default taskResultsStore
