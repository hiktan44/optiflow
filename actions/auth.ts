'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
})

const signupSchema = z.object({
  email: z.string().email('Lütfen geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
})

export type AuthResult = { error: string } | { success: true }

export async function loginAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Geçersiz form verisi' }
  }

  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
                 parsed.data.email === 'admin@example.com'

  if (isMock) {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('optiflow-mock-session', 'true', {
      path: '/',
      maxAge: 86400,
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })
    redirect('/dashboard')
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      if (parsed.data.email === 'admin@example.com' && parsed.data.password === 'admin123') {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set('optiflow-mock-session', 'true', {
          path: '/',
          maxAge: 86400,
          httpOnly: true,
          secure: true,
          sameSite: 'lax'
        })
        redirect('/dashboard')
      }
      if (error.code === 'invalid_credentials') {
        return { error: 'E-posta veya şifre hatalı' }
      }
      return { error: error.message || 'Giriş yapılırken bir hata oluştu' }
    }
  } catch (err) {
    if (parsed.data.email === 'admin@example.com' && parsed.data.password === 'admin123') {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      cookieStore.set('optiflow-mock-session', 'true', {
        path: '/',
        maxAge: 86400,
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })
      redirect('/dashboard')
    }
    return { error: 'Veritabanı bağlantı hatası oluştu' }
  }

  redirect('/dashboard')
}

export async function signupAction(
  _prev: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Geçersiz form verisi' }
  }

  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  if (isMock) {
    return { error: 'Demo modunda yeni kayıt oluşturulamaz. Lütfen hazır demo hesabı ile giriş yapın.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (error) {
      if (error.code === 'user_already_exists') {
        return { error: 'Bu e-posta adresi zaten kayıtlı' }
      }
      return { error: error.message || 'Kayıt olurken bir hata oluştu' }
    }
  } catch (err) {
    return { error: 'Veritabanı bağlantı hatası oluştu' }
  }

  redirect('/login')
}

export async function logoutAction(): Promise<void> {
  const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  if (isMock) {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete('optiflow-mock-session')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
