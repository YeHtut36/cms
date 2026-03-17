import { NavLink } from 'react-router-dom'
import type { Role } from '../../types/auth'

type SidebarItem = {
  to: string
  label: string
}

const baseItems: SidebarItem[] = [{ to: '/app/overview', label: 'Overview' }]

const roleItems: Record<Role, SidebarItem[]> = {
  ADMIN: [
    { to: '/app/payments', label: 'Payment Review' },
    { to: '/app/classes', label: 'Class Management' },
    { to: '/app/broadcast', label: 'Broadcast' },
    { to: '/app/students', label: 'Pending Students' },
  ],
  HR: [{ to: '/app/payments', label: 'Payment Review' }],
  STUDENT: [
    { to: '/app/notifications', label: 'Notifications' },
    { to: '/app/chat', label: 'Class Chat' },
  ],
}

export function AppSidebar({ role }: { role: Role }) {
  const items = [...baseItems, ...roleItems[role]]

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">ERP Panel</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">CMS Myanmar</h1>
      </div>

      <nav className="space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

