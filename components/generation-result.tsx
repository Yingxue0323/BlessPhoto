// 生成结果展示 - 显示生成的图片、下载/分享按钮
'use client'

import { Download, Share2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneratedImage } from '@/lib/types'

interface GenerationResultProps {
  image: GeneratedImage | null
  isLoading: boolean
  onReset: () => void
}

export function GenerationResult({ image, isLoading, onReset }: GenerationResultProps) {
  const handleDownload = () => {
    if (!image) return
    
    const link = document.createElement('a')
    link.href = `data:${image.mediaType};base64,${image.base64}`
    link.download = `blessphoto-${Date.now()}.${image.mediaType.split('/')[1] || 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!image) return
    
    try {
      const response = await fetch(`data:${image.mediaType};base64,${image.base64}`)
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
          src={`data:${image.mediaType};base64,${image.base64}`}
          alt="生成的祝福图片"
          className="w-full"
        />
      </div>

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
