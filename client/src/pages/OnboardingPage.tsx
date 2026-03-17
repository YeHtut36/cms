import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/InputField'
import { getPublicClasses } from '../services/classService'
import { FileUploadField } from '../components/ui/FileUploadField'
import { submitOnboarding, uploadPaymentProof } from '../services/onboardingService'
import type { ClassItem } from '../types/models'

export function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    classId: '',
    amountMmk: '',
    kpayTransactionId: '',
  })
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string>('')
  const [proofError, setProofError] = useState<string>('')

  useEffect(() => {
    getPublicClasses().then(setClasses).catch(() => undefined)
  }, [])

  useEffect(() => {
    const selectedClassId = searchParams.get('classId')
    if (selectedClassId) {
      setForm((prev) => ({ ...prev, classId: selectedClassId }))
    }
  }, [searchParams])

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        id: item.id,
        label: `${item.title} - ${item.priceMmk.toLocaleString()} MMK`,
        priceMmk: item.priceMmk,
      })),
    [classes],
  )

  useEffect(() => {
    const selected = classOptions.find((item) => item.id === form.classId)
    if (selected) {
      setForm((prev) => ({ ...prev, amountMmk: String(selected.priceMmk) }))
    }
  }, [classOptions, form.classId])

  useEffect(() => {
    if (!proofPreview) {
      return undefined
    }

    return () => URL.revokeObjectURL(proofPreview)
  }, [proofPreview])

  const handleProofChange = (file: File | null) => {
    if (!file) {
      setProofFile(null)
      setProofPreview('')
      setProofError('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setProofError('Please upload an image file (PNG/JPG).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProofError('Max file size is 5MB.')
      return
    }

    setProofError('')
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setInfo('')

    if (proofError) {
      setSubmitting(false)
      setError('Please fix the payment proof file selection before submitting.')
      return
    }

    try {
      let proofUrl: string | null = null

      if (proofFile) {
        const uploadResult = await uploadPaymentProof(proofFile)
        proofUrl = uploadResult.url
      }

      await submitOnboarding({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        classId: form.classId,
        amountMmk: Number(form.amountMmk),
        kpayTransactionId: form.kpayTransactionId,
        paymentProofUrl: proofUrl,
      })

      setInfo('Submitted successfully. HR/Admin will verify and then you can login with email/password.')
      setForm({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        classId: '',
        amountMmk: '',
        kpayTransactionId: '',
      })
      setProofFile(null)
      setProofPreview('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900">Student Onboarding + Payment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Fill your profile, choose a class, and submit KBZ transaction details. HR/Admin will verify and activate your account.
        </p>
      </Card>

      {error && <AlertMessage tone="error" message={error} />}
      {info && <AlertMessage tone="success" message={info} />}

      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <InputField label="Full name" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
          <InputField label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
          <InputField label="Email" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((p) => ({ ...p, password: v }))}
          />

          <label className="grid gap-1 text-sm text-slate-700">
            Class
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
              value={form.classId}
              onChange={(event) => setForm((p) => ({ ...p, classId: event.target.value }))}
              required
            >
              <option value="">Select class</option>
              {classOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <InputField
            label="Amount (MMK)"
            type="number"
            value={form.amountMmk}
            onChange={(v) => setForm((p) => ({ ...p, amountMmk: v }))}
          />
          <InputField
            label="KBZ Transaction ID"
            value={form.kpayTransactionId}
            onChange={(v) => setForm((p) => ({ ...p, kpayTransactionId: v }))}
          />
          <FileUploadField
            label="Upload payment proof (optional)"
            file={proofFile}
            onFileChange={handleProofChange}
            accept="image/png,image/jpeg,image/jpg,image/webp"
            helperText="Upload the KBZ Pay e-receipt screenshot."
            error={proofError}
          />

          {proofPreview && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">Preview</p>
                <button
                  className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                  onClick={() => handleProofChange(null)}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-white">
                <img alt="Payment proof preview" className="max-h-80 w-full object-contain" src={proofPreview} />
              </div>
            </div>
          )}

          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
      </Card>
    </section>
  )
}

