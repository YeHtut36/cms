import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Card } from '../components/ui/Card'
import { getPublicClass } from '../services/classService'
import type { ClassItem } from '../types/models'
import { formatDate } from '../utils/format'

export function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<ClassItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('Class not found.')
      setLoading(false)
      return
    }

    getPublicClass(id)
      .then((result) => {
        setItem(result)
        setError('')
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const openLightbox = () => setShowLightbox(true)
  const closeLightbox = () => setShowLightbox(false)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500" to="/">
          ← Back to classes
        </Link>
        {item && (
          <Link
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            to={`/onboarding?classId=${item.id}`}
          >
            Enroll & Pay
          </Link>
        )}
      </div>

      {loading && <p className="text-slate-600">Loading class details...</p>}
      {error && !loading && <AlertMessage tone="error" message={error} />}

      {item && !loading && (
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card>
            <div className="space-y-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">{item.status}</div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {item.priceMmk.toLocaleString()} MMK
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
                <p className="text-sm text-slate-600">{item.description || 'No description provided yet.'}</p>
              </div>

              <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                <DetailRow label="Category" value={item.category || '-'} />
                <DetailRow label="Instructor" value={item.instructorName || '-'} />
                <DetailRow label="Start" value={formatDate(item.startDate)} />
                <DetailRow label="End" value={formatDate(item.endDate)} />
                <DetailRow label="Duration" value={item.durationWeeks ? `${item.durationWeeks} weeks` : 'TBD'} />
                <DetailRow
                  label="Seats"
                  value={`${item.currentEnrollment}/${item.maxCapacity} enrolled`}
                />
                <DetailRow label="KBZ Pay Phone" value={item.kbzPayPhone || '-'} />
              </dl>

              <div className="rounded-xl border border-slate-200 p-4">
                <h2 className="text-lg font-semibold text-slate-900">How to enroll</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  <li>Click “Enroll & Pay” to submit your profile.</li>
                  <li>Pay via KBZ Pay and upload the receipt screenshot.</li>
                  <li>HR/Admin verifies payment. Once approved, you receive your student ID and can log in.</li>
                </ol>
              </div>

              {item.courseIncludes && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold text-slate-900">What this course includes</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.courseIncludes}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-3">
            {item.kbzQrImageUrl && (
              <Card>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">KBZ Pay QR</h3>
                  <p className="text-xs text-slate-600">Scan and include the transaction ID during onboarding.</p>
                  <button
                    className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    type="button"
                    onClick={openLightbox}
                  >
                    <img
                      alt="KBZ Pay QR"
                      className="mx-auto max-h-52 w-full max-w-sm object-contain transition duration-200 group-hover:scale-[1.015]"
                      src={item.kbzQrImageUrl}
                    />
                  </button>
                </div>
              </Card>
            )}

            {!item.kbzQrImageUrl && (
              <Card>
                <p className="text-sm text-slate-600">KBZ Pay instructions will be provided during onboarding.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {showLightbox && item?.kbzQrImageUrl && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="presentation"
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <button
              className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
              onClick={closeLightbox}
              type="button"
            >
              Close
            </button>
            <img alt="KBZ Pay QR enlarged" className="mx-auto max-h-[78vh] w-full object-contain" src={item.kbzQrImageUrl} />
          </div>
        </div>
      )}
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
