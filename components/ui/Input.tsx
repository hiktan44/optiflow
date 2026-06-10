import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-[#EF4444]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-lg border bg-white px-3 text-sm text-[#0F172A]',
            'placeholder:text-[#94A3B8]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-[#1E293B] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]',
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444]'
              : 'border-[#E2E8F0] dark:border-[#334155]',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[#64748B]">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-[#EF4444]"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#0F172A]',
            'placeholder:text-[#94A3B8] resize-y',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-[#1E293B] dark:text-[#F1F5F9] dark:placeholder:text-[#64748B]',
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444]'
              : 'border-[#E2E8F0] dark:border-[#334155]',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-[#EF4444]">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#64748B]">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
