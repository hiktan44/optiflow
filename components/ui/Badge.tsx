import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ExperimentStatus } from '@/lib/types'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | ExperimentStatus

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<string, string> = {
  default: 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8]',
  success: 'bg-[#D1FAE5] text-[#065F46]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  error: 'bg-[#FEE2E2] text-[#991B1B]',
  info: 'bg-[#EEF2FF] text-[#3730A3]',
  draft: 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#334155] dark:text-[#94A3B8]',
  running: 'bg-[#D1FAE5] text-[#065F46]',
  paused: 'bg-[#FEF3C7] text-[#92400E]',
  completed: 'bg-[#EEF2FF] text-[#3730A3]',
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusDot({ status }: { status: ExperimentStatus }) {
  const dotColors: Record<ExperimentStatus, string> = {
    draft: 'bg-[#94A3B8]',
    running: 'bg-[#10B981]',
    paused: 'bg-[#F59E0B]',
    completed: 'bg-[#6366F1]',
  }
  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColors[status])}
      aria-hidden="true"
    />
  )
}
