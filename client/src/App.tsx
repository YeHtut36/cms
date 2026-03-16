export { default } from './app/AppRoot'
/*

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactElement, ReactNode } from 'react'
import { Client } from '@stomp/stompjs'
import type { IMessage } from '@stomp/stompjs'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

type Role = 'ADMIN' | 'HR' | 'STUDENT'

type UserProfile = {
  id: string
  studentId: string | null
  fullName: string
  phone: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}

type ClassItem = {
  id: string
  title: string
  description: string | null
  category: string | null
  priceMmk: number
  kbzQrImageUrl: string | null
  startDate: string
  endDate: string | null
  status: string
  instructorName: string | null
  currentEnrollment: number
  maxCapacity: number
}

type PaymentItem = {
  id: string
  enrollmentId: string
  classId: string
  classTitle: string
  studentId: string
  studentName: string
  amountMmk: number
  kpayTransactionId: string
  paymentProofUrl: string | null
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason: string | null
  createdAt: string
}

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  classId: string | null
  classTitle: string | null
  createdAt: string
}

type ChatMessage = {
  id: string
  classId: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
}

type AuthState = {
  token: string | null
  user: UserProfile | null
}

type ApiError = {
  message?: string
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, { ...options, headers })
  if (!response.ok) {
    let errorMessage = 'Request failed.'
    try {
      const body = (await response.json()) as ApiError
      if (body.message) {
        errorMessage = body.message
      }
    } catch {
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  return (await response.json()) as T
}

function formatDate(dateText: string | null): string {
  if (!dateText) {
    return '-'
  }
  return new Date(dateText).toLocaleString()
}

function cardShell(children: ReactNode): ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">{children}</div>
  )
}

function App() {
  const [auth, setAuth] = useState<AuthState>({ token: localStorage.getItem('cms_token'), user: null })
  const [loadingUser, setLoadingUser] = useState<boolean>(false)

  useEffect(() => {
    if (!auth.token) {
      setAuth((prev) => ({ ...prev, user: null }))
      return
    }

    setLoadingUser(true)
    apiRequest<UserProfile>('/api/v1/users/me', {}, auth.token)
      .then((user) => setAuth((prev) => ({ ...prev, user })))
      .catch(() => {
        localStorage.removeItem('cms_token')
        setAuth({ token: null, user: null })
      })
      .finally(() => setLoadingUser(false))
  }, [auth.token])

  const actions = useMemo(
    () => ({
      login(token: string) {
        localStorage.setItem('cms_token', token)
        setAuth((prev) => ({ ...prev, token }))
      },
      logout() {
        localStorage.removeItem('cms_token')
        setAuth({ token: null, user: null })
      },
    }),
    [],
  )

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <TopNav auth={auth} loadingUser={loadingUser} onLogout={actions.logout} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Routes>
            <Route path="/" element={<PublicClassesPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage onLogin={actions.login} />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute auth={auth} loadingUser={loadingUser}>
                  <Dashboard auth={auth} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function TopNav({
  auth,
  loadingUser,
  onLogout,
}: {
  auth: AuthState
  loadingUser: boolean
  onLogout: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
          CMS Myanmar
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/">
            Classes
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/onboarding">
            Join
          </Link>
          {auth.token && auth.user ? (
            <>
              <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/app">
                Dashboard
              </Link>
              <button
                className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-700"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500" to="/login">
              Login
            </Link>
          )}
          {loadingUser && <span className="text-xs text-slate-400">Loading...</span>}
        </nav>
      </div>
    </header>
  )
}

function ProtectedRoute({
  auth,
  loadingUser,
  children,
}: {
  auth: AuthState
  loadingUser: boolean
  children: ReactElement
}) {
  const location = useLocation()
  if (loadingUser) {
    return <p className="p-6 text-center text-slate-500">Checking your account...</p>
  }
  if (!auth.token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function PublicClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    apiRequest<ClassItem[]>('/api/v1/public/classes')
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
      {error && <p className="rounded-xl bg-rose-50 p-3 text-rose-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {item.status}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 line-clamp-3 min-h-[72px] text-sm text-slate-600">
              {item.description || 'No description provided.'}
            </p>
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
                <dt>Price</dt>
                <dd className="font-semibold text-emerald-700">{item.priceMmk.toLocaleString()} MMK</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Start: {formatDate(item.startDate)}</span>
              <Link
                to="/onboarding"
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

function OnboardingPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    classId: '',
    amountMmk: '',
    kpayTransactionId: '',
    paymentProofUrl: '',
  })
  const [info, setInfo] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  useEffect(() => {
    apiRequest<ClassItem[]>('/api/v1/public/classes').then(setClasses).catch(() => undefined)
  }, [])

  useEffect(() => {
    const selected = classes.find((item) => item.id === form.classId)
    if (selected) {
      setForm((prev) => ({ ...prev, amountMmk: String(selected.priceMmk) }))
    }
  }, [form.classId, classes])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    try {
      await apiRequest('/api/v1/public/onboarding/payments', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          password: form.password,
          classId: form.classId,
          amountMmk: Number(form.amountMmk),
          kpayTransactionId: form.kpayTransactionId,
          paymentProofUrl: form.paymentProofUrl || null,
        }),
      })
      setInfo('Submitted successfully. HR will verify and then you can login with your email/password.')
      setForm({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        classId: '',
        amountMmk: '',
        kpayTransactionId: '',
        paymentProofUrl: '',
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      {cardShell(
        <>
          <h2 className="text-2xl font-semibold text-slate-900">Student Onboarding + Payment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Fill your profile, choose a class, and submit KBZ transaction details. HR/Admin will verify and activate your account.
          </p>
        </>,
      )}

      {error && <p className="rounded-xl bg-rose-50 p-3 text-rose-700">{error}</p>}
      {info && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-700">{info}</p>}

      {cardShell(
        <form className="grid gap-4" onSubmit={submit}>
          <Input label="Full name" value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          <Input
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
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{`${item.title} - ${item.priceMmk.toLocaleString()} MMK`}</option>
              ))}
            </select>
          </label>

          <Input
            label="Amount (MMK)"
            type="number"
            value={form.amountMmk}
            onChange={(v) => setForm((p) => ({ ...p, amountMmk: v }))}
          />
          <Input
            label="KBZ Transaction ID"
            value={form.kpayTransactionId}
            onChange={(v) => setForm((p) => ({ ...p, kpayTransactionId: v }))}
          />
          <Input
            label="Payment proof URL (optional)"
            value={form.paymentProofUrl}
            onChange={(v) => setForm((p) => ({ ...p, paymentProofUrl: v }))}
          />

          <button
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>,
      )}
    </section>
  )
}

function Input({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-700">
      {label}
      <input
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
    </label>
  )
}

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await apiRequest<{ token: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      onLogin(response.token)
      navigate('/app')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-4">
      {cardShell(
        <>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-600">Login with your onboarding email and password.</p>
        </>,
      )}

      {cardShell(
        <form className="grid gap-4" onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <Input label="Password" type="password" value={password} onChange={setPassword} />
          {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>,
      )}
    </section>
  )
}

function Dashboard({ auth }: { auth: AuthState }) {
  if (!auth.token || !auth.user) {
    return null
  }

  return (
    <section className="space-y-5">
      {cardShell(
        <>
          <p className="text-xs uppercase tracking-[0.18em] text-indigo-600">{auth.user.role}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{auth.user.fullName}</h2>
          <p className="text-sm text-slate-600">
            Email: {auth.user.email} {auth.user.studentId ? `| Student ID: ${auth.user.studentId}` : '| Awaiting student ID'}
          </p>
        </>,
      )}

      {(auth.user.role === 'HR' || auth.user.role === 'ADMIN') && <PaymentReview token={auth.token} />}
      {auth.user.role === 'ADMIN' && <AdminTools token={auth.token} />}
      {auth.user.role === 'STUDENT' && <StudentWorkspace token={auth.token} user={auth.user} />}
    </section>
  )
}

function PaymentReview({ token }: { token: string }) {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [error, setError] = useState<string>('')

  const load = () => {
    apiRequest<PaymentItem[]>('/api/v1/payments/pending', {}, token).then(setPayments).catch((err: Error) => setError(err.message))
  }

  useEffect(load, [token])

  const verify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    const rejectionReason = status === 'REJECTED' ? 'Rejected by reviewer.' : null
    await apiRequest(`/api/v1/payments/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    }, token)
    load()
  }

  return cardShell(
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Pending Payment Verification</h3>
      {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
      {payments.length === 0 && <p className="text-sm text-slate-500">No pending payments.</p>}
      <div className="space-y-2">
        {payments.map((payment) => (
          <div key={payment.id} className="rounded-xl border border-slate-200 p-3 text-sm">
            <p className="font-medium text-slate-800">{payment.classTitle}</p>
            <p className="text-slate-600">
              Student: {payment.studentName} | Tx: {payment.kpayTransactionId} | Amount: {payment.amountMmk.toLocaleString()} MMK
            </p>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
                onClick={() => verify(payment.id, 'VERIFIED')}
                type="button"
              >
                Verify
              </button>
              <button
                className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
                onClick={() => verify(payment.id, 'REJECTED')}
                type="button"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>,
  )
}

function AdminTools({ token }: { token: string }) {
  const [title, setTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [notificationInfo, setNotificationInfo] = useState<string>('')
  const [students, setStudents] = useState<UserProfile[]>([])

  useEffect(() => {
    apiRequest<UserProfile[]>('/api/v1/users/students/pending', {}, token).then(setStudents).catch(() => undefined)
  }, [token])

  const sendNotice = async (event: FormEvent) => {
    event.preventDefault()
    setNotificationInfo('')
    const result = await apiRequest<{ recipientCount: number }>('/api/v1/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title,
        message,
        type: 'GENERAL',
        target: 'ALL_STUDENTS',
      }),
    }, token)
    setNotificationInfo(`Notification sent to ${result.recipientCount} students.`)
    setTitle('')
    setMessage('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cardShell(
        <form className="grid gap-3" onSubmit={sendNotice}>
          <h3 className="text-lg font-semibold">Admin Broadcast</h3>
          <Input label="Title" value={title} onChange={setTitle} />
          <label className="grid gap-1 text-sm text-slate-700">
            Message
            <textarea
              className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
              onChange={(event) => setMessage(event.target.value)}
              required
              value={message}
            />
          </label>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" type="submit">
            Send Notification
          </button>
          {notificationInfo && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">{notificationInfo}</p>}
        </form>,
      )}

      {cardShell(
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Pending Students</h3>
          {students.length === 0 && <p className="text-sm text-slate-500">No pending student accounts.</p>}
          {students.map((student) => (
            <div key={student.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-800">{student.fullName}</p>
              <p className="text-slate-600">{student.email}</p>
              <p className="text-slate-500">Created: {formatDate(student.createdAt)}</p>
            </div>
          ))}
        </div>,
      )}
    </div>
  )
}

function StudentWorkspace({ token, user }: { token: string; user: UserProfile }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [chatClassId, setChatClassId] = useState<string>('')
  const [chatInput, setChatInput] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    apiRequest<NotificationItem[]>('/api/v1/notifications/my', {}, token).then(setNotifications).catch(() => undefined)
  }, [token])

  useEffect(() => {
    if (!chatClassId) {
      setMessages([])
      return
    }

    apiRequest<ChatMessage[]>(`/api/v1/chat/classes/${chatClassId}/messages`, {}, token)
      .then(setMessages)
      .catch(() => setMessages([]))
  }, [chatClassId, token])

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${wsProtocol}://${window.location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      client.subscribe('/user/queue/notifications', (frame: IMessage) => {
        const notification = JSON.parse(frame.body) as NotificationItem
        setNotifications((prev) => [notification, ...prev])
      })

      if (chatClassId) {
        client.subscribe(`/topic/classes/${chatClassId}/chat`, (frame: IMessage) => {
          const message = JSON.parse(frame.body) as ChatMessage
          setMessages((prev) => [...prev, message])
        })
      }
    }

    client.activate()
    return () => {
      client.deactivate()
    }
  }, [chatClassId, token])

  const sendChat = async (event: FormEvent) => {
    event.preventDefault()
    if (!chatClassId || !chatInput.trim()) {
      return
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${wsProtocol}://${window.location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
    })

    client.onConnect = () => {
      client.publish({
        destination: `/app/chat/classes/${chatClassId}/messages`,
        body: JSON.stringify({ message: chatInput.trim() }),
      })
      setChatInput('')
      client.deactivate()
    }

    client.activate()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {cardShell(
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-xs text-slate-500">Realtime queue + history for {user.email}</p>
          <div className="max-h-96 space-y-2 overflow-auto">
            {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
            {notifications.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-slate-600">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>,
      )}

      {cardShell(
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Class Chat</h3>
          <Input label="Class ID" value={chatClassId} onChange={setChatClassId} />
          <div className="max-h-64 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
            {messages.map((item) => (
              <div key={item.id} className="rounded bg-slate-50 p-2 text-sm">
                <p className="font-medium text-slate-800">{item.senderName}</p>
                <p className="text-slate-700">{item.message}</p>
                <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-slate-500">Enter class ID to load messages.</p>}
          </div>
          <form className="flex gap-2" onSubmit={sendChat}>
            <input
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type message"
              value={chatInput}
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700" type="submit">
              Send
            </button>
          </form>
        </div>,
      )}
    </div>
  )
}

export default App

*/

