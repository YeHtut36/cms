import type { ChangeEvent } from 'react'

type FileUploadFieldProps = {
  label: string
  file: File | null
  onFileChange: (file: File | null) => void
  accept?: string
  helperText?: string
  error?: string
}

export function FileUploadField({ label, file, onFileChange, accept, helperText, error }: FileUploadFieldProps) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0]
    onFileChange(picked ?? null)
  }

  return (
    <div className="grid gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50/60">
        <div className="flex flex-col text-left">
          <span className="text-slate-900">{file ? file.name : 'Click to select image'}</span>
          <span className="text-xs text-slate-500">PNG, JPG, or JPEG. Max 5MB.</span>
        </div>
        <input accept={accept} className="hidden" type="file" onChange={onChange} />
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">Choose File</span>
      </label>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
