// 生成结果展示 - 显示生成的图片、下载/分享按钮
'use client'

import { Download, Share2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneratedImage } from '@/lib/types'

interface GeneratedText {
  title: string
  mainText: string
  subtitle: string
}

interface GenerationResultProps {
  image: GeneratedImage | null
  isLoading: boolean
  onReset: () => void
  generatedText?: GeneratedText | null
}

export function GenerationResult({ image, isLoading, onReset, generatedText }: GenerationResultProps) {
  const getImageSrc = () => {
    if (!image) return ''
    if (image.url) return image.url
    if (image.base64) return `data:${image.mediaType};base64,${image.base64}`
    return ''
  }

  const handleDownload = () => {
    if (!image) return
    
    const link = document.createElement('a')
    link.href = getImageSrc()
    link.download = `blessphoto-${Date.now()}.${image.mediaType.split('/')[1] || 'png'}`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!image) return
    
    try {
      const imageSrc = getImageSrc()
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      const file = new File([blob], 'blessphoto.png', { type: image.mediaType })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'BlessPhoto 祝福图片',
          text: '送给你的祝福'
        })
      } else {
        handleDownload()
      }
    } catch {
      handleDownload()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <p className="mt-6 text-lg font-medium text-foreground">正在生成祝福图片...</p>
        <p className="mt-2 text-sm text-muted-foreground">AI 正在为您创作，请稍候</p>
      </div>
    )
  }

  if (!image) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">生成完成</h3>
        <p className="text-sm text-muted-foreground">您的祝福图片已准备就绪</p>
      </div>
      
      <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border-2 border-border shadow-lg">
        <img
          src={getImageSrc()}
          alt="生成的祝福图片"
          className="w-full"
          crossOrigin="anonymous"
        />
      </div>

      {/* 显示 AI 生成的文案 */}
      {generatedText && (
        <div className="mx-auto max-w-md rounded-lg bg-secondary/30 p-4 space-y-2">
          <p className="text-xs text-muted-foreground">AI 生成的祝福文案：</p>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">{generatedText.title}</p>
            <p className="text-foreground/90">{generatedText.mainText}</p>
            <p className="text-muted-foreground italic">{generatedText.subtitle}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          保存图片
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          分享
        </Button>
        <Button onClick={onReset} variant="secondary" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          再生成一张
        </Button>
      </div>
    </div>
  )
}
