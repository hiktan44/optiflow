import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  description?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  trend,
  description,
  className,
}: MetricCardProps) {
  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus

  const trendColor =
    trend?.direction === 'up'
      ? 'text-[#10B981]'
      : trend?.direction === 'down'
      ? 'text-[#EF4444]'
      : 'text-[#64748B]'

  return (
    <article
      className={cn(
        'rounded-xl border border-[#E2E8F0] bg-white p-6',
        'dark:border-[#334155] dark:bg-[#1E293B]',
        className
      )}
    >
      <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{title}</p>
      <p className="mt-2 text-4xl font-bold text-[#0F172A] dark:text-[#F1F5F9] font-tabular">
        {value}
      </p>
      {trend && (
        <div className={cn('mt-2 flex items-center gap-1', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-xs font-medium">{trend.value}</span>
        </div>
      )}
      {description && (
        <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
      )}
    </article>
  )
}
