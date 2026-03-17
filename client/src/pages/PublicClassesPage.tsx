import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertMessage } from '../components/ui/AlertMessage'
import { getPublicClasses } from '../services/classService'
import type { ClassItem } from '../types/models'
import { formatDate } from '../utils/format'

export function PublicClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getPublicClasses()
      .then(setClasses)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Class Management System</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Learn. Pay. Get Approved. Start fast.</h1>
        <p className="mt-3 max-w-3xl text-indigo-50">
          Visitors can view classes, submit KBZ Pay transaction, and become active students after HR verification.
        </p>
      </div>

      {loading && <p className="text-slate-500">Loading classes...</p>}
      {error && <AlertMessage tone="error" message={error} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((item) => (
          <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">{item.status}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {item.priceMmk.toLocaleString()} MMK
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 min-h-[72px] overflow-hidden text-sm text-slate-600">{item.description || 'No description provided.'}</p>
            <dl className="mt-4 space-y-1 text-sm text-slate-600">
              <div className="flex justify-between gap-3">
                <dt>Category</dt>
                <dd className="font-medium text-slate-800">{item.category || '-'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Instructor</dt>
                <dd className="font-medium text-slate-800">{item.instructorName || '-'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Start</dt>
                <dd className="font-medium text-slate-800">{formatDate(item.startDate)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-1 items-end justify-between gap-2">
              <Link
                to={`/classes/${item.id}`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View details
              </Link>
              <Link
                to={`/onboarding?classId=${item.id}`}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Enroll now
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

