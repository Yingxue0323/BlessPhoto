// 页脚组件
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">BlessPhoto</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">使用条款</a>
            <a href="#" className="hover:text-foreground transition-colors">隐私政策</a>
            <a href="#" className="hover:text-foreground transition-colors">联系我们</a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BlessPhoto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
