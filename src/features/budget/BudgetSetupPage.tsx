import { useMemo } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBudgetRecords, useCreateBudget, useProjectsList } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const budgetSchema = z.object({
  project: z.string().min(1, 'Project is required'),
  cost_center: z.string().min(1, 'Cost center is required'),
  budget_type: z.string().min(1, 'Budget type is required'),
  budget_amount: z.coerce.number().min(0.01, 'Budget amount must be greater than 0'),
  fiscal_year: z.string().min(1, 'Fiscal year is required'),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

export function BudgetSetupPage() {
  const { data: budgetRecords, isLoading: isBudgetLoading, error: budgetError } = useBudgetRecords()
  const { data: projects, isLoading: isProjectsLoading } = useProjectsList()
  const createBudget = useCreateBudget()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      project: '',
      cost_center: '',
      budget_type: '',
      budget_amount: 0,
      fiscal_year: '',
    },
  })

  const onSubmit: SubmitHandler<BudgetFormValues> = async (values) => {
    try {
      await createBudget.mutateAsync(values)
      reset()
    } catch (err) {
      const message = err instanceof ApiError ? err.serverMessage ?? err.message : 'Could not save budget.'
      alert(message)
    }
  }

  const budgetSummary = useMemo(
    () => budgetRecords?.reduce((acc, record) => acc + record.budget_amount, 0) ?? 0,
    [budgetRecords]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Budget setup</h1>
          <p className="text-sm text-gray-500">Define budget allocations by project, cost center and cost type.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New budget allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <select id="project" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" {...register('project')}>
                <option value="">
                  {isProjectsLoading ? 'Loading projects...' : 'Select project'}
                </option>
                {projects?.map((project) => (
                  <option key={project.name} value={project.name}>{project.project_name}</option>
                ))}
              </select>
              {errors.project && <p className="text-sm text-status-overdue">{errors.project.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_center">Cost center</Label>
              <Input id="cost_center" {...register('cost_center')} />
              {errors.cost_center && <p className="text-sm text-status-overdue">{errors.cost_center.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_type">Budget type</Label>
              <Input id="budget_type" {...register('budget_type')} />
              {errors.budget_type && <p className="text-sm text-status-overdue">{errors.budget_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_amount">Budget amount</Label>
              <Input id="budget_amount" type="number" step="0.01" {...register('budget_amount', { valueAsNumber: true })} />
              {errors.budget_amount && <p className="text-sm text-status-overdue">{errors.budget_amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year">Fiscal year</Label>
              <Input id="fiscal_year" {...register('fiscal_year')} />
              {errors.fiscal_year && <p className="text-sm text-status-overdue">{errors.fiscal_year.message}</p>}
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting || createBudget.status === 'pending'}>
                {createBudget.status === 'pending' ? 'Saving...' : 'Save budget'}
              </Button>
              <span className="text-sm text-gray-500">Total budgeted: ${budgetSummary.toFixed(2)}</span>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existing budget allocations</CardTitle>
        </CardHeader>
        <CardContent>
          {isBudgetLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading budgets...
            </div>
          ) : budgetError ? (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
              Could not load budget allocations.
            </div>
          ) : budgetRecords?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Cost center</th>
                    <th className="py-3 pr-4">Budget type</th>
                    <th className="py-3 pr-4">Budget amount</th>
                    <th className="py-3 pr-4">Fiscal year</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRecords.map((budget) => (
                    <tr key={budget.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{budget.project || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{budget.cost_center}</td>
                      <td className="py-3 pr-4 text-gray-700">{budget.budget_type || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">${budget.budget_amount.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-gray-700">{budget.fiscal_year || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No budget allocations have been created yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
