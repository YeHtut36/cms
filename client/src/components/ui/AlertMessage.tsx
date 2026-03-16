export function AlertMessage({
  tone,
  message,
}: {
  tone: 'error' | 'success'
  message: string
}) {
  const toneClasses =
    tone === 'error'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return <p className={`rounded-xl border p-3 text-sm ${toneClasses}`}>{message}</p>
}

