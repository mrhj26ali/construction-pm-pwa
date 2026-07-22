import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AuthGuard } from './AuthGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
//import { ProjectsListPage } from '@/features/projects/ProjectsListPage'
//import { NewProjectPage } from '@/features/projects/NewProjectPage'
import { AdminPage } from '@/features/admin/AdminPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {

        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
         // { path: '/projects', element: <ProjectsListPage /> },
         // { path: '/projects/new', element: <NewProjectPage /> },
          { path: '/admin', element: <AdminPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])