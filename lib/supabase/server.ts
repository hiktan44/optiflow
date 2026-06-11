import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
               process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
               !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock Supabase Client Proxy
export const createMockSupabase = () => {
  const queryHandler: any = {
    get(target: any, prop: string): any {
      if (prop === 'then') {
        const mockResult = {
          data: target._data || (target._single ? {} : []),
          error: null,
          count: 0
        }
        return (resolve: any) => resolve(mockResult)
      }
      
      if (['select', 'eq', 'single', 'order', 'limit', 'range', 'insert', 'update', 'upsert', 'delete', 'match', 'or', 'neq', 'gt', 'lt'].includes(prop)) {
        return (...args: any[]) => {
          if (prop === 'single') {
            target._single = true
          }
          if (target._table === 'profiles') {
            target._data = {
              id: 'mock-user-id',
              full_name: 'Demo Admin',
              plan: 'premium',
              credits_used: 2,
              created_at: new Date().toISOString()
            }
          } else if (target._table === 'creatives') {
            target._data = target._single ? {
              id: 'mock-creative-id',
              name: 'Demo Kreatif',
              status: 'completed',
              image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
              credits_used: 1,
              created_at: new Date().toISOString()
            } : [
              {
                id: 'mock-creative-id-1',
                name: 'Kreatif Kampanya A',
                status: 'completed',
                image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
                credits_used: 1,
                created_at: new Date().toISOString()
              },
              {
                id: 'mock-creative-id-2',
                name: 'Kreatif Kampanya B',
                status: 'completed',
                image_url: 'https://images.unsplash.com/photo-1618005148471-26c9943e6590',
                credits_used: 1,
                created_at: new Date().toISOString()
              }
            ]
          } else if (target._table === 'brand_kits') {
            target._data = target._single ? {
              id: 'mock-brand-id',
              name: 'Demo Marka',
              logo_url: null,
              primary_color: '#7C3AED',
              secondary_color: '#10B981',
              font_family: 'Inter'
            } : [
              {
                id: 'mock-brand-id',
                name: 'Demo Marka',
                logo_url: null,
                primary_color: '#7C3AED',
                secondary_color: '#10B981',
                font_family: 'Inter'
              }
            ]
          }
          return new Proxy(target, queryHandler)
        }
      }
      return new Proxy(target, queryHandler)
    }
  }

  const client = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'mock-user-id', email: 'admin@example.com' } },
        error: null
      }),
      getSession: async () => ({
        data: { session: { user: { id: 'mock-user-id', email: 'admin@example.com' } } },
        error: null
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        data: { user: { id: 'mock-user-id', email: 'admin@example.com' } },
        error: null
      })
    },
    from(table: string) {
      return new Proxy({ _table: table, _single: false }, queryHandler)
    },
    storage: {
      from(bucket: string) {
        return {
          upload: async () => ({ data: { path: 'mock-path' }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe' } })
        }
      }
    }
  }
  return client as any
}

export async function createClient() {
  if (isMock) return createMockSupabase()

  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie mutations ignored
          }
        },
      },
    }
  )
}

export async function createServiceClient() {
  if (isMock) return createMockSupabase()

  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createServerClient(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  if (isMock) return createMockSupabase()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { persistSession: false } }
  )
}
