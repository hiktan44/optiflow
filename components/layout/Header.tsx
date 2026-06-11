import { createClient } from '@/lib/supabase/server'
import { ThemeToggle } from './ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { LogOut, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { logoutAction } from '@/actions/auth'

interface HeaderProps {
  breadcrumb?: { label: string; href?: string }[]
}

export async function Header({ breadcrumb }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <header
      className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 dark:border-[#334155] dark:bg-[#1E293B]"
      role="banner"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm" role="list">
          {breadcrumb?.map((crumb, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-[#CBD5E1]" aria-hidden="true">
                  /
                </span>
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-[#64748B] hover:text-[#0F172A] transition-colors dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu email={user?.email ?? ''} initials={initials} />
      </div>
    </header>
  )
}

function UserMenu({ email, initials }: { email: string; initials: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-semibold text-white hover:bg-[#4338CA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
        aria-label={`User menu for ${email}`}
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-xs text-[#64748B] truncate">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 text-[#EF4444]">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
