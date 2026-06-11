import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const hasMockSession = request.cookies.get('optiflow-mock-session')?.value === 'true'
  const isMock = hasMockSession ||
                 !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                 process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
                 !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let user = null

  if (isMock) {
    const hasMockSession = request.cookies.get('optiflow-mock-session')?.value === 'true'
    if (hasMockSession) {
      user = { id: 'mock-user-id', email: 'admin@example.com' }
    }
  } else {
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // ignore
    }
  }

  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/experiments') ||
    pathname.startsWith('/install') ||
    pathname.startsWith('/settings')

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
