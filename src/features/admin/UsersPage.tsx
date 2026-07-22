import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUsers, useCreateUser, useSetUserEnabled } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserPlus, Loader2, AlertTriangle } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'
import type { PlatformUser } from '@/types/user'

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Enter a valid email'),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

export function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const setEnabled = useSetUserEnabled()
  const [formError, setFormError] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PlatformUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) })

  async function onSubmit(values: CreateUserFormValues) {
    setFormError(null)
    try {
      await createUser.mutateAsync({
        email: values.email,
        first_name: values.firstName,
        send_welcome_email: 0,
      })
      reset()
    } catch (err) {
      const msg =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create user — check the email is unique and valid.'
      setFormError(msg)
    }
  }

  async function executeToggle(user: PlatformUser) {
    setToggleError(null)
    setPendingEmail(user.email)
    try {
      await setEnabled.mutateAsync({ email: user.email, enabled: !user.enabled })
    } catch (err) {
      const msg =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not update user status. Please try again.'
      setToggleError(msg)
    } finally {
      setPendingEmail(null)
      setConfirmTarget(null)
      setIsDialogOpen(false)
    }
  }

  function handleToggleClick(user: PlatformUser) {
    if (user.enabled) {
      setConfirmTarget(user)
      setIsDialogOpen(true)
      return
    }
    void executeToggle(user)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-brand-900">User Accounts</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create user</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-status-overdue">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newUserEmail">Email</Label>
              <Input id="newUserEmail" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-status-overdue">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <UserPlus size={16} className="mr-1.5" />
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-status-overdue">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All users</CardTitle>
        </CardHeader>
        <CardContent>
          {toggleError && (
            <div className="mb-4 rounded-md border border-status-overdue/30 bg-status-overdue/10 px-4 py-3 text-sm text-status-overdue">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} />
                <span>{toggleError}</span>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-gray-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => {
                  const rowPending = pendingEmail === u.email
                  return (
                    <tr key={u.name} className="border-b border-surface-border last:border-0">
                      <td className="py-2 text-brand-900">{u.full_name}</td>
                      <td className="py-2 text-gray-600">{u.email}</td>
                      <td className="py-2">
                        <span className={u.enabled ? 'text-status-ontrack' : 'text-status-overdue'}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleClick(u)}
                          disabled={rowPending}
                        >
                          {rowPending ? 'Saving...' : u.enabled ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
            <AlertDialogDescription>
              Deactivating this user will block their access to the platform. You can reactivate
              them later without creating a new account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                size="sm"
                disabled={!confirmTarget}
                onClick={() => confirmTarget && void executeToggle(confirmTarget)}
              >
                Deactivate
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}