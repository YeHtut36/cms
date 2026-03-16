import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TopNav } from '../components/layout/TopNav'
import { ProtectedRoute } from '../components/routes/ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { PublicClassesPage } from '../pages/PublicClassesPage'

export default function AppRoot() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <TopNav />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <Routes>
            <Route path="/" element={<PublicClassesPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardPage />
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

