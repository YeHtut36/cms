import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TopNav } from '../components/layout/TopNav'
import { ProtectedRoute } from '../components/routes/ProtectedRoute'
import { AppLayout } from './AppLayout'
import { OverviewPage } from '../pages/OverviewPage'
import { PaymentsPage } from '../pages/PaymentsPage'
import { ClassManagementPage } from '../pages/ClassManagementPage'
import { BroadcastPage } from '../pages/BroadcastPage'
import { PendingStudentsPage } from '../pages/PendingStudentsPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { ClassChatPage } from '../pages/ClassChatPage'
import { LoginPage } from '../pages/LoginPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { PublicClassesPage } from '../pages/PublicClassesPage'

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  )
}

export default function AppRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <PublicClassesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PublicLayout>
              <OnboardingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="classes" element={<ClassManagementPage />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="students" element={<PendingStudentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="chat" element={<ClassChatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

