'use client'

import { Mail, Calendar, Award } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export function ProfileInfo() {
  const { profile, isConfigured } = useAuth()

  if (!profile) return null

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email?.slice(0, 2).toUpperCase() || 'U'

  // 判断用户类型
  const hasActivePurchasedCredits = profile.purchased_credits > 0 && 
    (!profile.credits_expire_at || new Date(profile.credits_expire_at) > new Date())
  
  const userType = hasActivePurchasedCredits ? '付费用户' : '免费用户'
  const userTypeColor = hasActivePurchasedCredits ? 'text-amber-600' : 'text-slate-500'

  return (
    <div className="space-y-6">
      {/* 头像 */}
      <div className="flex justify-center md:justify-start">
        <Avatar className="h-32 w-32 border-4 border-primary/10 shadow-sm">
          <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* 用户信息 - 细体文字 */}
      <div className="space-y-4 font-light text-foreground">
        {/* 姓名 */}
        <div>
          <h1 className="text-3xl font-light tracking-wide mb-1">
            {profile.name || '用户'}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className={`h-4 w-4 ${userTypeColor}`} />
            <span className={`text-sm ${userTypeColor}`}>{userType}</span>
          </div>
        </div>

        {/* 邮箱 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5" />
            <span>邮箱</span>
          </div>
          <p className="text-sm text-foreground pl-5">
            {profile.email}
          </p>
        </div>

        {/* 注册时间 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5" />
            <span>注册时间</span>
          </div>
          <p className="text-sm text-foreground pl-5">
            {new Date(profile.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Demo 模式提示 */}
        {!isConfigured && (
          <div className="pt-4 mt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              演示模式
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
