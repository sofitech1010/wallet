import type React from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps {
  children: React.ReactNode
  className?: string
  gradient?: string
}

export function GradientCard({
  children,
  className,
  gradient = "from-purple-500/10 via-blue-500/10 to-cyan-500/10",
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br backdrop-blur-sm",
        gradient,
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
