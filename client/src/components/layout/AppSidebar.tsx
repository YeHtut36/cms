import type { Role } from '../../types/auth'

type SidebarItem = {
  href: string
  label: string
}

const baseItems: SidebarItem[] = [{ href: '#overview', label: 'Overview' }]

const roleItems: Record<Role, SidebarItem[]> = {
  ADMIN: [
    { href: '#payments', label: 'Payment Review' },
    { href: '#classes', label: 'Class Management' },
    { href: '#broadcast', label: 'Broadcast' },
    { href: '#students', label: 'Pending Students' },
  ],
  HR: [
    { href: '#payments', label: 'Payment Review' },
  ],
  STUDENT: [
    { href: '#notifications', label: 'Notifications' },
    { href: '#chat', label: 'Class Chat' },
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
          <a
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

