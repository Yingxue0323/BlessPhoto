// 核心生成器 - 整合主题选择、上传、生成流程
'use client'

import { useState } from 'react'
import { Sparkles, AlertCircle, Wand2, Loader2 } from 'lucide-react'
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
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { isLoggedIn, canGenerate, isLoading, user, incrementUsage } = useAuth()

  const canGenerateText = selectedTheme && blessingText.trim().length > 0
  const canGenerateImage = image && generatedText

  // Step 1: Generate structured blessing text
  const handleGenerateText = async () => {
    if (!canGenerateText) return
    
    if (!isLoggedIn) {
      onNeedLogin()
      return
    }

    setIsGeneratingText(true)
    setError(null)
    setGeneratedText(null)

    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: selectedTheme.id,
          userInput: blessingText.trim(),
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '文案生成失败')
      }

      setGeneratedText(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文案生成过程中出现错误')
    } finally {
      setIsGeneratingText(false)
    }
  }

  // Step 2: Generate image with the structured text
  const handleGenerateImage = async () => {
    if (!canGenerateImage || !selectedTheme || !generatedText) return
    
    if (!canGenerate) {
      onNeedCredits()
      return
    }

    setIsGeneratingImage(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const fullBlessingText = `${generatedText.title}\n\n${generatedText.mainText}\n\n${generatedText.subtitle}`

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: image,
          themeId: selectedTheme.id,
          blessingText: fullBlessingText,
          userId: user?.id,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === 'LIMIT_REACHED') {
          onNeedCredits()
          throw new Error('免费额度已用完，请购买更多额度')
        }
        throw new Error(data.error || '图片生成失败')
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImage(data.images[0])
        // Update local usage count
        await incrementUsage()
      } else {
        throw new Error('未能生成图片')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片生成过程中出现错误')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleReset = () => {
    setGeneratedImage(null)
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
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          创建祝福图片
        </h1>
        <p className="mt-3 text-muted-foreground">
          上传照片，选择主题，AI 帮你生成精美的祝福卡片
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
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

          <Button
            onClick={handleGenerateText}
            disabled={!canGenerateText || isGeneratingText}
            variant="secondary"
            className="w-full gap-2"
          >
            {isGeneratingText ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成文案中...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                AI 优化祝福文案
              </>
            )}
          </Button>
        </div>

        {/* Generated Text Preview */}
        {generatedText && (
          <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
            <p className="text-xs text-muted-foreground">AI 生成的祝福文案：</p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{generatedText.title}</p>
              <p className="text-sm text-foreground/90">{generatedText.mainText}</p>
              <p className="text-sm text-muted-foreground italic">{generatedText.subtitle}</p>
            </div>
          </div>
        )}

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
        {isLoggedIn && !canGenerate && !isLoading && (
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

        {/* Step 3: Generate image */}
        <Button
          onClick={handleGenerateImage}
          disabled={!canGenerateImage || isGeneratingImage || !isLoggedIn || (!canGenerate && !isLoading)}
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
