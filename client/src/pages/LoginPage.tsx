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
    <section className="mx-auto max-w-md space-y-4">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-600">Login with your onboarding email and password.</p>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <InputField label="Email" type="email" value={email} onChange={setEmail} />
          <InputField label="Password" type="password" value={password} onChange={setPassword} />
          {error && <AlertMessage tone="error" message={error} />}

          <button
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </Card>
    </section>
  )
}

