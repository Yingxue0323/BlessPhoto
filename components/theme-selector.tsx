// 主题选择器 - 8种祝福主题卡片
'use client'

import { cn } from '@/lib/utils'
import type { BlessingTheme } from '@/lib/types'
import { BLESSING_THEMES } from '@/lib/types'

interface ThemeSelectorProps {
  selected: BlessingTheme | null
  onSelect: (theme: BlessingTheme) => void
}

export function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        选择祝福主题
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BLESSING_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelect(theme)}
            className={cn(
              'group flex flex-row items-center justify-center gap-2 rounded-lg border p-2 transition-all duration-200',
              'hover:border-primary/50 hover:bg-secondary/50',
              selected?.id === theme.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card'
            )}
          >
            <span className="text-xl" role="img" aria-label={theme.name}>
              {theme.icon}
            </span>
            <span className="text-sm font-medium whitespace-nowrap">{theme.name}</span>
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-sm text-muted-foreground mt-2">
          {selected.description}
        </p>
      )}
    </div>
  )
}
