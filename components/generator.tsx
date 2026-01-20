// 核心生成器 - 整合主题选择、上传、生成流程
'use client'

import { useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/image-uploader'
import { ThemeSelector } from '@/components/theme-selector'
import { BlessingInput } from '@/components/blessing-input'
import { GenerationResult } from '@/components/generation-result'
import { useAuth } from '@/hooks/use-auth'
import type { BlessingTheme, GeneratedImage } from '@/lib/types'

interface GeneratorProps {
  onNeedCredits: () => void
  onNeedLogin: () => void
}

interface GeneratedText {
  title: string
  mainText: string
  subtitle: string
}

export function Generator({ onNeedCredits, onNeedLogin }: GeneratorProps) {
  const [image, setImage] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<BlessingTheme | null>(null)
  const [blessingText, setBlessingText] = useState('')
  const [generatedText, setGeneratedText] = useState<GeneratedText | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { isLoggedIn, canGenerate: hasCredits, isLoading, user, incrementUsage } = useAuth()

  const canGenerate = selectedTheme && blessingText.trim().length > 0 && image

  // 一键生成：文案优化 + 图片生成
  const handleGenerateImage = async () => {
    if (!canGenerate || !selectedTheme) return
    
    if (!isLoggedIn) {
      onNeedLogin()
      return
    }

    if (!hasCredits) {
      onNeedCredits()
      return
    }

    setIsGeneratingImage(true)
    setError(null)
    setGeneratedImage(null)
    setGeneratedText(null)

    try {
      // 第一步：生成文案
      const textResponse = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: selectedTheme.id,
          userInput: blessingText.trim(),
        })
      })

      const textData = await textResponse.json()

      if (!textResponse.ok) {
        throw new Error(textData.error || '文案生成失败')
      }

      const generatedTextData = textData.text
      setGeneratedText(generatedTextData)

      // 第二步：生成图片
      const fullBlessingText = `${generatedTextData.title}\n\n${generatedTextData.mainText}\n\n${generatedTextData.subtitle}`

      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: image,
          themeId: selectedTheme.id,
          blessingText: fullBlessingText,
          userId: user?.id,
        })
      })

      const imageData = await imageResponse.json()

      if (!imageResponse.ok) {
        if (imageData.code === 'LIMIT_REACHED') {
          onNeedCredits()
          throw new Error('免费额度已用完，请购买更多额度')
        }
        throw new Error(imageData.error || '图片生成失败')
      }

      // 检查是否为异步任务（返回 taskId）
      if (imageData.taskId && imageData.status === 'processing') {
        console.log('[generator] Task created, taskId:', imageData.taskId)
        console.log('[generator] Polling for result...')
        
        // 轮询查询任务状态（前端轮询，最多 60 秒）
        const maxAttempts = 20 // 20 次 × 3 秒
        const pollInterval = 3000 // 3 秒
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`[generator] Polling attempt ${attempt}/${maxAttempts}`)
          
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          
          const checkResponse = await fetch(`/api/check-task?taskId=${imageData.taskId}`)
          const checkData = await checkResponse.json()
          
          if (checkData.success && checkData.images) {
            console.log('[generator] ✅ Image ready!')
            setGeneratedImage(checkData.images[0])
            await incrementUsage()
            return // 成功，退出
          }
          
          if (checkData.error) {
            throw new Error(checkData.error)
          }
          
          // 继续等待
          console.log('[generator] Still processing...')
        }
        
        throw new Error('图片生成超时，请重试')
      }

      // 同步返回图片（兼容旧逻辑）
      if (imageData.images && imageData.images.length > 0) {
        setGeneratedImage(imageData.images[0])
        await incrementUsage()
      } else {
        throw new Error('未能生成图片')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成过程中出现错误')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleReset = () => {
    setGeneratedImage(null)
    setGeneratedText(null)
    setError(null)
  }

  const handleFullReset = () => {
    setImage(null)
    setSelectedTheme(null)
    setBlessingText('')
    setGeneratedText(null)
    setGeneratedImage(null)
    setError(null)
  }

  if (generatedImage || isGeneratingImage) {
    return (
      <div className="mx-auto max-w-2xl">
        <GenerationResult
          image={generatedImage}
          isLoading={isGeneratingImage}
          onReset={handleReset}
          generatedText={generatedText}
        />
        {generatedImage && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={handleFullReset}>
              创建新的祝福图片
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          创建祝福图片
        </h1>
        <p className="mt-3 text-muted-foreground">
          上传照片，选择主题，AI 帮你生成精美的祝福卡片
        </p>
      </div> */}

        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm space-y-6">
        {/* Step 1: Select theme and input blessing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
            选择主题和输入祝福语
          </div>
          
          <ThemeSelector selected={selectedTheme} onSelect={setSelectedTheme} />
          
          <BlessingInput
            value={blessingText}
            onChange={setBlessingText}
            themeName={selectedTheme?.id}
          />
        </div>

        <div className="border-t border-border" />

        {/* Step 2: Upload image */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
            上传照片
          </div>
          
          <ImageUploader image={image} onImageChange={setImage} />
        </div>

        <div className="border-t border-border" />

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Login prompt */}
        {!isLoggedIn && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
            <span>请先登录后再生成图片</span>
            <button
              onClick={onNeedLogin}
              className="font-medium text-primary hover:underline"
            >
              点击登录
            </button>
          </div>
        )}

        {/* Credits warning */}
        {isLoggedIn && !hasCredits && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
            <span>您的免费额度已用完，</span>
            <button
              onClick={onNeedCredits}
              className="font-medium text-primary hover:underline"
            >
              点击购买更多额度
            </button>
          </div>
        )}

        {/* Generate button */}
        <Button
          onClick={handleGenerateImage}
          disabled={!canGenerate || isGeneratingImage || !isLoggedIn}
          className="w-full gap-2"
          size="lg"
        >
          <Sparkles className="h-5 w-5" />
          生成祝福图片
        </Button>
      </div>
    </div>
  )
}
