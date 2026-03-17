import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertMessage } from '../components/ui/AlertMessage'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/InputField'
import { useAuth } from '../hooks/useAuth'
import { login } from '../services/authService'

export function LoginPage() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await login(email, password)
      loginWithToken(response.accessToken)
      navigate('/app')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl py-4 md:py-10">
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
        <div className="bg-slate-900 p-8 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">CMS ERP</p>
          <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
          <p className="mt-3 text-sm text-slate-200">
            Sign in with your onboarding account to access classes, notifications, and payment workflow.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <Card>
            <form className="grid gap-4" onSubmit={submit}>
              <h3 className="text-xl font-semibold text-slate-900">Login</h3>
              <InputField label="Email" type="email" value={email} onChange={setEmail} />
              <InputField label="Password" type="password" value={password} onChange={setPassword} />
              {error && <AlertMessage tone="error" message={error} />}

              <button
                className="rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}

