import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AuthGuard } from './AuthGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [{ path: '/dashboard', element: <DashboardPage /> }],
      },
    ],
  },
])