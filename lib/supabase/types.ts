// 数据库类型定义和常量配置

export interface UserProfile {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
    
    // 额度系统（简化版）
    free_credits: number               // 免费额度（终身1次）
    purchased_credits: number          // 购买的剩余额度
    credits_expire_at: string | null   // 购买额度过期时间
    
    // 统计
    total_usage_count: number          // 总使用次数
    
    created_at: string
    updated_at: string
  }
  
  export interface RemainingCredits {
    free: number           // 免费额度
    purchased: number      // 购买的剩余额度
    total: number          // 总剩余额度
  }
  
  /**
   * 使用记录接口（可选，用于详细统计）
   */
  export interface UsageRecord {
    id: string
    user_id: string
    theme: string
    created_at: string
  }
  
export enum PlanType {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface PlanConfig {
  id: PlanType
  name: string
  credits: number
  price: number
  validity_days: number
  description: string
}
  