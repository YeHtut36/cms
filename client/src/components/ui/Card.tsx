import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">{children}</div>
}

