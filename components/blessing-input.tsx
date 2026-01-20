// 祝福语输入框 - 带推荐祝福语的文本输入
'use client'

import { Textarea } from '@/components/ui/textarea'

interface BlessingInputProps {
  value: string
  onChange: (value: string) => void
  themeName?: string
}

const SUGGESTIONS: Record<string, string[]> = {
  wedding: ['百年好合，永结同心', '愿你们的爱情像陈年美酒，历久弥香', '执子之手，与子偕老'],
  birthday: ['生日快乐，愿所有美好如期而至', '又长一岁，愿你永远年轻快乐', '愿你的每一天都充满阳光'],
  graduation: ['学业有成，前程似锦', '毕业快乐，未来可期', '愿你的未来闪闪发光'],
  housewarming: ['乔迁之喜，幸福安康', '新居落成，万事如意', '愿新家充满欢声笑语'],
  'pet-birthday': ['生日快乐，小可爱', '愿你永远健康快乐', '感谢你的陪伴'],
  greeting: ['愿你今天心情愉快', '想你了，发条消息问候你', '愿你一切都好'],
  'new-year': ['新年快乐，万事如意', '愿新的一年充满希望', '恭喜发财，大吉大利'],
  thanksgiving: ['感恩有你，一路相伴', '谢谢你的存在', '感恩生命中遇见你']
}

export function BlessingInput({ value, onChange, themeName }: BlessingInputProps) {
  const suggestions = themeName ? SUGGESTIONS[themeName] || [] : []

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        填写祝福语
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在这里写下你的祝福..."
        className="min-h-[100px] resize-none"
        maxLength={20}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {value.length}/20 字
        </span>
        <span className="text-xs text-muted-foreground">
          AI 会自动扩写并排版
        </span>
      </div>
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">参考祝福语：</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(suggestion)}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
