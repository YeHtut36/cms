import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/InputField'
import { FileUploadField } from '../components/ui/FileUploadField'
import { AlertMessage } from '../components/ui/AlertMessage'
import { createClass, deleteClass, getMyClasses, updateClass, uploadKbzQrImage } from '../services/classService'
import { sendBroadcastNotification } from '../services/notificationService'
import { getPendingStudents } from '../services/userService'
import type { ClassStatus, UserProfile } from '../types/models'
import type { ClassItem } from '../types/models'
import { formatDate, toInputDateTimeValue } from '../utils/format'

type AdminPanelMode = 'all' | 'classes' | 'broadcast' | 'students'

export function AdminPanel({ token, mode = 'all' }: { token: string; mode?: AdminPanelMode }) {
  const [title, setTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [sendInfo, setSendInfo] = useState<string>('')
  const [sendError, setSendError] = useState<string>('')
  const [pendingStudents, setPendingStudents] = useState<UserProfile[]>([])
  const [myClasses, setMyClasses] = useState<ClassItem[]>([])
  const [classInfo, setClassInfo] = useState<string>('')
  const [classError, setClassError] = useState<string>('')
  const [creatingClass, setCreatingClass] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    courseIncludes: '',
    category: '',
    instructorName: '',
    priceMmk: '',
    maxCapacity: '30',
    durationWeeks: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING' as ClassStatus,
    kbzQrImageUrl: '',
    kbzPayPhone: '',
  })
  const [kbzQrFile, setKbzQrFile] = useState<File | null>(null)
  const [kbzQrPreview, setKbzQrPreview] = useState<string>('')
  const [kbzQrError, setKbzQrError] = useState<string>('')

  const showClasses = mode === 'all' || mode === 'classes'
  const showBroadcast = mode === 'all' || mode === 'broadcast'
  const showStudents = mode === 'all' || mode === 'students'

  useEffect(() => {
    if (!showStudents) {
      return
    }
    getPendingStudents(token).then(setPendingStudents).catch(() => undefined)
  }, [token, showStudents])

  useEffect(() => {
    if (!showClasses) {
      return
    }
    getMyClasses(token).then(setMyClasses).catch(() => undefined)
  }, [token, showClasses])

  useEffect(() => {
    if (!kbzQrPreview) {
      return undefined
    }
    return () => URL.revokeObjectURL(kbzQrPreview)
  }, [kbzQrPreview])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSendError('')
    setSendInfo('')

    try {
      const result = await sendBroadcastNotification(title, message, token)
      setSendInfo(`Notification sent to ${result.recipientCount} students.`)
      setTitle('')
      setMessage('')
    } catch (err) {
      setSendError((err as Error).message)
    }
  }

  const submitClass = async (event: FormEvent) => {
    event.preventDefault()
    setCreatingClass(true)
    setClassInfo('')
    setClassError('')

    if (!classForm.title || !classForm.startDate || !classForm.priceMmk) {
      setCreatingClass(false)
      setClassError('Title, start date, and price are required.')
      return
    }

    if (kbzQrError) {
      setCreatingClass(false)
      setClassError('Please fix the KBZ QR upload before submitting.')
      return
    }

    let kbzQrUrl = classForm.kbzQrImageUrl || null

    if (kbzQrFile) {
      try {
        const uploadResult = await uploadKbzQrImage(kbzQrFile, token)
        kbzQrUrl = uploadResult.url
      } catch (err) {
        setClassError((err as Error).message)
        setCreatingClass(false)
        return
      }
    }

    const paymentDetails = classForm.kbzPayPhone ? `KBZ Pay Phone: ${classForm.kbzPayPhone}` : ''
    const combinedDescription = [classForm.description, paymentDetails].filter(Boolean).join('\n\n') || null

    try {
      const payload = {
        title: classForm.title,
        description: combinedDescription,
        category: classForm.category || null,
        priceMmk: Number(classForm.priceMmk),
        kbzQrImageUrl: kbzQrUrl,
        courseIncludes: classForm.courseIncludes || null,
        kbzPayPhone: classForm.kbzPayPhone || null,
        startDate: classForm.startDate,
        endDate: classForm.endDate || null,
        durationWeeks: classForm.durationWeeks ? Number(classForm.durationWeeks) : null,
        maxCapacity: Number(classForm.maxCapacity),
        status: classForm.status,
        instructorName: classForm.instructorName || null,
      }

      if (editingId) {
        await updateClass(editingId, payload, token)
        setClassInfo('Class updated successfully.')
      } else {
        await createClass(payload, token)
        setClassInfo('Class created successfully. It is now available based on status.')
      }

      resetForm()
      getMyClasses(token).then(setMyClasses).catch(() => undefined)
    } catch (err) {
      setClassError((err as Error).message)
    } finally {
      setCreatingClass(false)
    }
  }

  const handleKbzQrChange = (file: File | null) => {
    if (!file) {
      setKbzQrFile(null)
      setKbzQrPreview('')
      setKbzQrError('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setKbzQrError('KBZ QR must be an image (PNG/JPG).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setKbzQrError('Max file size is 5MB.')
      return
    }

    setKbzQrError('')
    setKbzQrFile(file)
    setKbzQrPreview(URL.createObjectURL(file))
  }

  const removeClass = async (classId: string) => {
    try {
      await deleteClass(classId, token)
      setMyClasses((prev) => prev.filter((item) => item.id !== classId))
      if (editingId === classId) {
        resetForm()
      }
    } catch (err) {
      setClassError((err as Error).message)
    }
  }

  const resetForm = () => {
    setClassForm({
      title: '',
      description: '',
      courseIncludes: '',
      category: '',
      instructorName: '',
      priceMmk: '',
      maxCapacity: '30',
      durationWeeks: '',
      startDate: '',
      endDate: '',
      status: 'UPCOMING',
      kbzQrImageUrl: '',
      kbzPayPhone: '',
    })
    setKbzQrFile(null)
    setKbzQrPreview('')
    setKbzQrError('')
    setEditingId(null)
  }

  const editClass = (item: ClassItem) => {
    setEditingId(item.id)
    setClassForm({
      title: item.title,
      description: item.description ?? '',
      courseIncludes: item.courseIncludes ?? '',
      category: item.category ?? '',
      instructorName: item.instructorName ?? '',
      priceMmk: String(item.priceMmk),
      maxCapacity: String(item.maxCapacity),
      durationWeeks: item.durationWeeks ? String(item.durationWeeks) : '',
      startDate: toInputDateTimeValue(item.startDate),
      endDate: toInputDateTimeValue(item.endDate),
      status: item.status as ClassStatus,
      kbzQrImageUrl: item.kbzQrImageUrl ?? '',
      kbzPayPhone: '',
    })
    setKbzQrPreview(item.kbzQrImageUrl ?? '')
    setClassInfo('Editing existing class. Save changes or reset to create new.')
    setClassError('')
  }

  const gridClass = showClasses && showBroadcast ? 'grid gap-4 xl:grid-cols-[1.4fr,1fr]' : 'grid gap-4'

  return (
    <div className="space-y-4">
      <div className={gridClass}>
        {showClasses && (
          <Card>
            <form className="grid gap-3" onSubmit={submitClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit Class' : 'Create Class'}</h3>
                  <p className="text-sm text-slate-500">Publish or update classes with pricing, schedule, and KBZ QR upload.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {classInfo && <AlertMessage tone="success" message={classInfo} />}
                  {classError && <AlertMessage tone="error" message={classError} />}
                </div>
              </div>

              <InputField label="Title" value={classForm.title} onChange={(v) => setClassForm((p) => ({ ...p, title: v }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Category"
                  value={classForm.category}
                  onChange={(v) => setClassForm((p) => ({ ...p, category: v }))}
                  required={false}
                />
                <InputField
                  label="Instructor"
                  value={classForm.instructorName}
                  onChange={(v) => setClassForm((p) => ({ ...p, instructorName: v }))}
                  required={false}
                />
                <InputField
                  label="Price (MMK)"
                  type="number"
                  value={classForm.priceMmk}
                  onChange={(v) => setClassForm((p) => ({ ...p, priceMmk: v }))}
                />
                <InputField
                  label="Max Capacity"
                  type="number"
                  value={classForm.maxCapacity}
                  onChange={(v) => setClassForm((p) => ({ ...p, maxCapacity: v }))}
                />
                <InputField
                  label="Duration Weeks"
                  type="number"
                  required={false}
                  value={classForm.durationWeeks}
                  onChange={(v) => setClassForm((p) => ({ ...p, durationWeeks: v }))}
                />
                <label className="grid gap-1.5 text-sm text-slate-700">
                  <span className="font-medium">Status</span>
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    value={classForm.status}
                    onChange={(event) => setClassForm((p) => ({ ...p, status: event.target.value as ClassStatus }))}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                  </select>
                </label>
                <InputField
                  label="Start Date"
                  type="datetime-local"
                  value={classForm.startDate}
                  onChange={(v) => setClassForm((p) => ({ ...p, startDate: v }))}
                />
                <InputField
                  label="End Date"
                  type="datetime-local"
                  required={false}
                  value={classForm.endDate}
                  onChange={(v) => setClassForm((p) => ({ ...p, endDate: v }))}
                />
              </div>

              <label className="grid gap-1.5 text-sm text-slate-700">
                <span className="font-medium">Description</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={classForm.description}
                  onChange={(event) => setClassForm((p) => ({ ...p, description: event.target.value }))}
                  placeholder="Short promo copy for the class"
                />
              </label>

              <label className="grid gap-1.5 text-sm text-slate-700">
                <span className="font-medium">What this course includes</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  value={classForm.courseIncludes}
                  onChange={(event) => setClassForm((p) => ({ ...p, courseIncludes: event.target.value }))}
                  placeholder="Modules, tools, support, live sessions, community, certificate, etc."
                />
                <span className="text-xs text-slate-500">Supports multi-line; keep it concise and scannable.</span>
              </label>

              <div className="space-y-2 text-sm text-slate-700">
                <FileUploadField
                  label="KBZ QR Image"
                  file={kbzQrFile}
                  onFileChange={handleKbzQrChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  helperText="Upload the KBZ Pay QR used for this class."
                  error={kbzQrError}
                />
                {kbzQrPreview && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <img alt="KBZ QR preview" className="w-full max-h-80 object-contain" src={kbzQrPreview} />
                  </div>
                )}
                <InputField
                  label="KBZ Pay Phone"
                  required={false}
                  value={classForm.kbzPayPhone}
                  placeholder="09-xxxxxxxxx"
                  onChange={(v) => setClassForm((p) => ({ ...p, kbzPayPhone: v }))}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
                  type="submit"
                  disabled={creatingClass}
                >
                  {creatingClass ? 'Saving...' : editingId ? 'Save changes' : 'Create Class'}
                </button>
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={resetForm}
                  disabled={creatingClass}
                >
                  Reset
                </button>
              </div>
            </form>
          </Card>
        )}

        {showClasses && (
          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">My Classes</h3>
                <span className="text-xs font-semibold text-slate-500">{myClasses.length} total</span>
              </div>
              {myClasses.length === 0 && <p className="text-sm text-slate-500">No classes yet.</p>}

              {myClasses.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Start</th>
                        <th className="px-4 py-3">Seats</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {myClasses.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">{item.status}</span>
                          </td>
                          <td className="px-4 py-3">{formatDate(item.startDate)}</td>
                          <td className="px-4 py-3">{item.currentEnrollment}/{item.maxCapacity}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                onClick={() => editClass(item)}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                onClick={() => removeClass(item.id)}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {showBroadcast && (
          <Card>
            <form id="broadcast" className="grid gap-3" onSubmit={submit}>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Admin Broadcast</h3>
                <p className="text-sm text-slate-500">Send a real-time announcement to active students.</p>
              </div>

              <InputField label="Title" value={title} onChange={setTitle} />
              <label className="grid gap-1.5 text-sm text-slate-700">
                <span className="font-medium">Message</span>
                <textarea
                  className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  value={message}
                />
              </label>
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700" type="submit">
                Send Notification
              </button>
              {sendInfo && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{sendInfo}</p>}
              {sendError && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{sendError}</p>}
            </form>
          </Card>
        )}
      </div>

      {showStudents && (
        <Card>
          <div id="students" className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Pending Students</h3>
            {pendingStudents.length === 0 && <p className="text-sm text-slate-500">No pending student accounts.</p>}

            {pendingStudents.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {pendingStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{student.fullName}</td>
                        <td className="px-4 py-3">{student.email}</td>
                        <td className="px-4 py-3">{formatDate(student.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

