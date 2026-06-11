/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { createBrowserClient } from '@supabase/ssr'

const checkMock = () => {
  const hasMockSession = typeof document !== 'undefined' && document.cookie.includes('optiflow-mock-session=true')
  return hasMockSession || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL.includes("mock") ||
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// Mock Supabase Client Proxy for Client Components
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
      
      if (['select', 'eq', 'single', 'order', 'limit', 'range', 'insert', 'update', 'upsert', 'delete', 'match', 'or', 'neq', 'gt', 'lt', 'in'].includes(prop)) {
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
          } else if (target._table === 'projects') {
            target._data = target._single ? {
              id: 'mock-project-id',
              name: 'Demo Proje'
            } : [
              { id: 'mock-project-id', name: 'Demo Proje' }
            ]
          } else if (target._table === 'experiments') {
            target._data = target._single ? {
              id: 'mock-creative-id',
              name: 'Demo Deney',
              status: 'completed',
              target_url: 'https://example.com',
              created_at: new Date().toISOString()
            } : [
              {
                id: 'mock-creative-id-1',
                name: 'Anasayfa A/B Testi',
                status: 'running',
                target_url: 'https://example.com',
                created_at: new Date().toISOString()
              },
              {
                id: 'mock-creative-id-2',
                name: 'Ödeme Butonu Renk Deneyi',
                status: 'completed',
                target_url: 'https://example.com',
                created_at: new Date().toISOString()
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

export function createClient() {
  if (checkMock()) return createMockSupabase()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
