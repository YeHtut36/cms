import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/InputField'
import { createClass } from '../services/classService'
import { sendBroadcastNotification } from '../services/notificationService'
import { getPendingStudents } from '../services/userService'
import type { ClassStatus, UserProfile } from '../types/models'
import { formatDate } from '../utils/format'

export function AdminPanel({ token }: { token: string }) {
  const [title, setTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [sendInfo, setSendInfo] = useState<string>('')
  const [sendError, setSendError] = useState<string>('')
  const [pendingStudents, setPendingStudents] = useState<UserProfile[]>([])
  const [classInfo, setClassInfo] = useState<string>('')
  const [classError, setClassError] = useState<string>('')
  const [creatingClass, setCreatingClass] = useState<boolean>(false)
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    category: '',
    instructorName: '',
    priceMmk: '',
    maxCapacity: '30',
    durationWeeks: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING' as ClassStatus,
    thumbnailUrl: '',
    kbzQrImageUrl: '',
  })

  useEffect(() => {
    getPendingStudents(token).then(setPendingStudents).catch(() => undefined)
  }, [token])

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

    try {
      await createClass(
        {
          title: classForm.title,
          description: classForm.description || null,
          category: classForm.category || null,
          thumbnailUrl: classForm.thumbnailUrl || null,
          priceMmk: Number(classForm.priceMmk),
          kbzQrImageUrl: classForm.kbzQrImageUrl || null,
          startDate: new Date(classForm.startDate).toISOString(),
          endDate: classForm.endDate ? new Date(classForm.endDate).toISOString() : null,
          durationWeeks: classForm.durationWeeks ? Number(classForm.durationWeeks) : null,
          maxCapacity: Number(classForm.maxCapacity),
          status: classForm.status,
          instructorName: classForm.instructorName || null,
        },
        token,
      )

      setClassInfo('Class created successfully. It is now available based on status.')
      setClassForm({
        title: '',
        description: '',
        category: '',
        instructorName: '',
        priceMmk: '',
        maxCapacity: '30',
        durationWeeks: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
        thumbnailUrl: '',
        kbzQrImageUrl: '',
      })
    } catch (err) {
      setClassError((err as Error).message)
    } finally {
      setCreatingClass(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <form className="grid gap-3" onSubmit={submitClass}>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Create Class</h3>
            <p className="text-sm text-slate-500">Publish new classes with pricing, schedule, and payment QR setup.</p>
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
            />
          </label>

          <InputField
            label="Thumbnail URL"
            required={false}
            value={classForm.thumbnailUrl}
            onChange={(v) => setClassForm((p) => ({ ...p, thumbnailUrl: v }))}
          />
          <InputField
            label="KBZ QR Image URL"
            required={false}
            value={classForm.kbzQrImageUrl}
            onChange={(v) => setClassForm((p) => ({ ...p, kbzQrImageUrl: v }))}
          />

          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-60"
            type="submit"
            disabled={creatingClass}
          >
            {creatingClass ? 'Creating...' : 'Create Class'}
          </button>

          {classInfo && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{classInfo}</p>}
          {classError && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{classError}</p>}
        </form>
      </Card>

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

      <div className="xl:col-span-2">
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
      </div>
    </div>
  )
}

