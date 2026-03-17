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
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
      />
    </label>
  )
}

