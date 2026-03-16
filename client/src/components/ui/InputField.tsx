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
    <label className="grid gap-1 text-sm text-slate-700">
      {label}
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
      />
    </label>
  )
}

