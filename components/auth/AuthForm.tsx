'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isMock && mode === 'login' ? {
      email: 'admin@example.com',
      password: 'admin123'
    } : undefined
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    if (isMock) {
      try {
        if (mode === 'signup') {
          toast.info('Demo modunda yeni kayıt oluşturulamaz. Lütfen hazır demo hesabı ile giriş yapın.')
          setLoading(false)
          return
        }
        
        // Demo Giriş Bypass
        document.cookie = "optiflow-mock-session=true; path=/; max-age=86400"
        toast.success('Demo girişi başarılı!')
        router.push('/dashboard')
        router.refresh()
      } catch {
        toast.error('Giriş yapılırken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
      return
    }

    const supabase = createClient()

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
        router.push('/login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {isMock && mode === 'login' && (
        <div className="p-3 mb-2 text-xs rounded-lg border border-amber-200/50 bg-amber-50/50 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
          <p className="font-semibold mb-1">🔑 Demo Giriş Bilgileri:</p>
          <p>E-posta: <code className="bg-amber-100/60 dark:bg-amber-950/40 px-1 py-0.5 rounded">admin@example.com</code></p>
          <p className="mt-0.5">Şifre: <code className="bg-amber-100/60 dark:bg-amber-950/40 px-1 py-0.5 rounded">admin123</code></p>
        </div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </Button>
    </form>
  )
}
