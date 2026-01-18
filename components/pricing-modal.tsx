// 定价弹窗 - 展示套餐和购买选项
'use client'

import { X, Check, Zap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICING_PLANS, ENTERPRISE_PLAN } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planId: string) => void
}

export function PricingModal({ isOpen, onClose, onSelectPlan }: PricingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">购买额度</h2>
            <p className="text-sm text-muted-foreground">选择适合您的套餐</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-xl border-2 p-6 transition-all',
                  plan.popular
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      <Zap className="h-3 w-3" />
                      最受欢迎
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.credits} 张图片
                  </p>
                  <p className="text-xs text-muted-foreground">
                    约 ${plan.pricePerImage.toFixed(2)}/张
                  </p>
                </div>

                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  className={cn(
                    'mt-6 w-full',
                    plan.popular ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  选择此套餐
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border-2 border-border bg-muted/30 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{ENTERPRISE_PLAN.name}</h3>
                    <p className="text-sm text-muted-foreground">适合企业和团队使用</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-foreground">${ENTERPRISE_PLAN.price}</span>
                    <span className="text-muted-foreground">/{ENTERPRISE_PLAN.period}</span>
                  </div>
                </div>
                
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {ENTERPRISE_PLAN.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => onSelectPlan('enterprise')}
                  variant="outline"
                  className="mt-4"
                >
                  联系我们
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            支付由 Stripe 安全处理 · 支持信用卡和借记卡
          </p>
        </div>
      </div>
    </div>
  )
}
