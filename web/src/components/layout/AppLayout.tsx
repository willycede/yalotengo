import { Boxes, FolderOpen, Package, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/categorias', label: 'Categorías', icon: FolderOpen },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/perfil', label: 'Perfil', icon: User },
] as const

/**
 * Mobile-first shell. On phones navigation lives in a bottom bar within thumb
 * reach; from `md` up the same items become a persistent sidebar. Both render
 * from one NAV_ITEMS list, so the two layouts can never drift apart.
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-6">
          <Boxes className="size-6 text-accent" aria-hidden />
          <span className="text-lg font-bold text-content">YaLoTengo</span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-content-muted hover:bg-surface-sunken hover:text-content',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-[calc(var(--spacing-nav)+env(safe-area-inset-bottom))] md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-safe md:hidden',
        )}
      >
        <div className="grid h-nav grid-cols-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
                  isActive ? 'text-accent' : 'text-content-muted',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
