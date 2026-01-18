// 首页 - 整合所有组件的主入口
'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Generator } from '@/components/generator'
import { PricingModal } from '@/components/pricing-modal'
import { Footer } from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'

export default function Home() {
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const { signInWithGoogle } = useAuth()

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
      // 这里应该跳转到 Stripe 支付页面
      alert(`即将跳转到支付页面购买 ${credits} 张图片额度。\n\n注意：当前为演示模式，需要集成 Stripe 后才能完成实际支付。`)
      setIsPricingOpen(false)
    }
  }

  const handleNeedLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('[v0] Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onPricingClick={() => setIsPricingOpen(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Hero />
        <section className="py-12">
          <Generator 
            onNeedCredits={() => setIsPricingOpen(true)} 
            onNeedLogin={handleNeedLogin}
          />
        </section>
      </main>

      <Footer />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  )
}
