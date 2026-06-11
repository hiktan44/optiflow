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
import { loginAction, signupAction } from '@/actions/auth'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır'),
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

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    try {
      if (mode === 'signup') {
        const res = await signupAction(null, formData)
        if (res && 'error' in res) {
          toast.error(res.error)
        } else {
          toast.success('Kayıt başarılı! Lütfen giriş yapın.')
          router.push('/login')
        }
      } else {
        const res = await loginAction(null, formData)
        if (res && 'error' in res) {
          toast.error(res.error)
        } else {
          toast.success('Giriş başarılı!')
        }
      }
    } catch (err) {
      toast.error('Giriş/Kayıt işlemi sırasında bir hata oluştu.')
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
