// 图片上传 - 拖拽/点击上传，预览功能
'use client'

import React from "react"

import { useState, useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  image: string | null
  onImageChange: (base64: string | null) => void
}

export function ImageUploader({ image, onImageChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onImageChange(result)
    }
    reader.readAsDataURL(file)
  }, [onImageChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const clearImage = useCallback(() => {
    onImageChange(null)
  }, [onImageChange])

  if (image) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          已上传照片
        </label>
        <div className="relative group">
          <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-xl border-2 border-border bg-muted">
            <img
              src={image || "/placeholder.svg"}
              alt="上传的照片"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
              aria-label="删除图片"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        上传照片
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <ImageIcon className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            拖拽图片到此处或点击上传
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            支持 JPG、PNG 格式，最大 10MB
          </p>
        </div>
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            选择文件
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  )
}
