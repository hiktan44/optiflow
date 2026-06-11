'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  asChild?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#4F46E5] text-white hover:bg-[#4338CA] focus-visible:ring-[#4F46E5]',
  secondary:
    'bg-[#6366F1] text-white hover:bg-[#4F46E5] focus-visible:ring-[#6366F1]',
  outline:
    'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] focus-visible:ring-[#4F46E5] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F1F5F9] dark:hover:bg-[#273449]',
  ghost:
    'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] dark:hover:bg-[#1E293B] dark:hover:text-[#F1F5F9]',
  danger:
    'bg-[#EF4444] text-white hover:bg-red-600 focus-visible:ring-[#EF4444]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-11 px-6 text-base rounded-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const commonProps = {
      className: cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      ),
      ...props
    }

    if (asChild) {
      return (
        <Slot ref={ref} {...commonProps}>
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...commonProps}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
