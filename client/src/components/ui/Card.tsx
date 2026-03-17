import type { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md">
      {children}
    </div>
  )
}
