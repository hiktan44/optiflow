'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FlaskConical,
  Code2,
  Settings,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { Plan } from '@/lib/types'

interface SidebarProps {
  plan?: Plan
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/experiments', label: 'Experiments', icon: FlaskConical },
  { href: '/install', label: 'Install', icon: Code2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const planBadgeVariant: Record<Plan, 'default' | 'info' | 'success'> = {
  free: 'default',
  pro: 'info',
  enterprise: 'success',
}

export function Sidebar({ plan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLinks = () => (
    <nav aria-label="Main navigation">
      <ul className="space-y-1" role="list">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#273449] dark:hover:text-[#F1F5F9]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-sm dark:border-[#334155] dark:bg-[#1E293B] lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <Menu className="h-4 w-4 text-[#64748B]" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-60 flex-col bg-white shadow-xl transition-transform duration-200',
          'dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-[#334155]',
          'lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <LogoMark />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-1 text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <PlanChip plan={plan} />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col',
          'bg-white border-r border-[#E2E8F0]',
          'dark:bg-[#1E293B] dark:border-[#334155]'
        )}
        aria-label="Desktop navigation"
      >
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155]">
          <LogoMark />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <PlanChip plan={plan} />
        </div>
      </aside>
    </>
  )
}

function LogoMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]">
        <Zap className="h-4 w-4 text-white" aria-hidden="true" />
      </div>
      <span className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
        OptiFlow
      </span>
    </Link>
  )
}

function PlanChip({ plan }: { plan: Plan }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">Current plan</span>
      <Badge variant={planBadgeVariant[plan]} className="capitalize">
        {plan}
      </Badge>
    </div>
  )
}
