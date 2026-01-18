'use client'

import { ImageIcon, TrendingUp, Gift, ShoppingCart, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

interface UsageStatsProps {
  onUpgradeClick: () => void
}

export function UsageStats({ onUpgradeClick }: UsageStatsProps) {
  const { profile, remainingCredits } = useAuth()

  if (!profile) return null

  const totalCredits = profile.free_credits + profile.purchased_credits
  const usedCredits = profile.total_usage_count
  const usagePercentage = totalCredits > 0 
    ? Math.min(100, ((totalCredits - remainingCredits) / totalCredits) * 100)
    : 0
  
  // 确定颜色
  const getProgressColor = () => {
    if (remainingCredits === 0) return 'text-destructive'
    if (usagePercentage >= 80) return 'text-amber-500'
    return 'text-primary'
  }

  const getProgressBg = () => {
    if (remainingCredits === 0) return 'stroke-destructive'
    if (usagePercentage >= 80) return 'stroke-amber-500'
    return 'stroke-primary'
  }

  // 圆形进度条参数
  const size = 140
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (usagePercentage / 100) * circumference

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          使用统计
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 圆形进度条 */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* 背景圆圈 */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                fill="none"
                className="stroke-muted"
              />
              {/* 进度圆圈 */}
              {totalCredits > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  className={`${getProgressBg()} transition-all duration-500`}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                  }}
                />
              )}
            </svg>
            {/* 中心内容 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getProgressColor()}`}>
                {remainingCredits}
              </span>
              <span className="text-xs text-muted-foreground">剩余次数</span>
            </div>
          </div>
        </div>

        {/* 统计网格 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{usedCredits}</p>
            <p className="text-xs text-muted-foreground">已使用</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCredits}</p>
            <p className="text-xs text-muted-foreground">总额度</p>
          </div>
        </div>

        {/* 使用进度条 */}
        {totalCredits > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">使用进度</span>
              <span className={`font-medium ${getProgressColor()}`}>
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  remainingCredits === 0 ? 'bg-destructive' : 
                  usagePercentage >= 80 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              已用 {usedCredits} / 总计 {totalCredits} 次
            </p>
          </div>
        )}

        {/* 额度构成明细 */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">免费额度</span>
            </div>
            <span className="font-medium text-foreground">{profile.free_credits} 次</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">购买额度</span>
            </div>
            <span className="font-medium text-foreground">{profile.purchased_credits} 次</span>
          </div>

          {/* 购买额度过期时间 */}
          {profile.credits_expire_at && profile.purchased_credits > 0 && (
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">过期时间</span>
              </div>
              <span className="font-medium text-foreground text-xs">
                {new Date(profile.credits_expire_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* 注册时间 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">注册时间</span>
            </div>
            <span className="font-medium text-foreground text-xs">
              {new Date(profile.created_at).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* 购买按钮 */}
        <Button 
          onClick={onUpgradeClick}
          className="w-full gap-2 mt-4"
          size="lg"
          variant={profile.purchased_credits > 0 ? 'outline' : 'default'}
        >
          <ShoppingCart className="h-4 w-4" />
          {profile.purchased_credits > 0 ? '购买更多额度' : '购买额度包'}
        </Button>
      </CardContent>
    </Card>
  )
}
