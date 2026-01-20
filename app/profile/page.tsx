'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProfileInfo } from '@/components/profile/profile-info'
import { UsageStats } from '@/components/profile/usage-stats'
import { PricingModal } from '@/components/pricing-modal'

export default function ProfilePage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/')
    }
  }, [isLoading, isLoggedIn, router])

  const handleSelectPlan = (planId: string) => {
    if (planId === 'enterprise') {
      alert('企业版咨询请发送邮件至：enterprise@blessphoto.com')
      return
    }

    const creditsMap: Record<string, number> = {
      starter: 10,
      popular: 25,
      pro: 60
    }

    const credits = creditsMap[planId]
    if (credits) {
      alert(`即将跳转到支付页面购买 ${credits} 张图片额度。\n\n注意：当前为演示模式，需要集成 Stripe 后才能完成实际支付。`)
      setShowPricing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onPricingClick={() => setShowPricing(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* 左侧：用户信息文字 */}
            <div className="md:w-1/3 md:sticky md:top-8">
              <ProfileInfo />
        </div>

            {/* 右侧：使用统计卡片 */}
            <div className="flex-1">
              <UsageStats onUpgradeClick={() => setShowPricing(true)} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
