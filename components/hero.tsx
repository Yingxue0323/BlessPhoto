// 首页横幅 - 产品介绍和特性展示
'use client'

import { Sparkles, Heart, Gift, GraduationCap, Home, Cake } from 'lucide-react'

const features = [
  { icon: Heart, label: '婚礼祝福' },
  { icon: Cake, label: '生日祝福' },
  { icon: GraduationCap, label: '毕业祝福' },
  { icon: Home, label: '乔迁祝福' },
  { icon: Gift, label: '节日祝福' }
]

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          AI 智能生成祝福图片
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
          用 AI 创造
          <span className="text-primary">温暖的祝福</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
          上传您的照片，选择祝福主题，填写祝福语，
          AI 将为您生成独一无二的祝福卡片，让每一份祝福都充满心意
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
