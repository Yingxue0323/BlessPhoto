// 顶部导航 - Logo、额度显示、购买按钮、用户头像
'use client'

import { Sparkles, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { useAuth } from '@/hooks/use-auth'

interface HeaderProps {
  onPricingClick: () => void
}

export function Header({ onPricingClick }: HeaderProps) {
  const { isLoggedIn, remainingCredits, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">BlessPhoto</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {isLoading ? (
                  '加载中...'
                ) : (
                  <>剩余 <span className="text-primary font-semibold">
                    {remainingCredits === Infinity ? '无限' : remainingCredits}
                  </span> 次</>
                )}
              </span>
            </div>
          )}
          <Button onClick={onPricingClick} variant="outline" size="sm">
            购买额度
          </Button>
          <UserAvatar />
        </div>
      </div>
    </header>
  )
}
