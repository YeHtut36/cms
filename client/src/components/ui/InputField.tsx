type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}

export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder,
}: InputFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <input
        className="rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3 text-slate-900 outline-none shadow-[0_1px_0_0_rgba(15,23,42,0.03)] transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
      />
    </label>
  )
}
