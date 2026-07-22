import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProcurement, useCreateMaterialRequest } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const materialRequestSchema = z.object({
  project: z.string().min(1, 'Project is required'),
  material_request_type: z.string().min(1, 'Request type is required'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  schedule_date: z.string().min(1, 'Schedule date is required'),
  item_code: z.string().min(1, 'Item code is required'),
  qty: z.coerce.number().min(1, 'Quantity must be at least 1'),
  description: z.string().optional(),
})

type MaterialRequestFormValues = z.infer<typeof materialRequestSchema>

interface ProcurementPageProps {
  projectName: string
}

export function ProcurementPage({ projectName }: ProcurementPageProps) {
  const { data: procurement, isLoading, error } = useProcurement(projectName)
  const createRequest = useCreateMaterialRequest()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialRequestFormValues>({
    resolver: zodResolver(materialRequestSchema) as any,
    defaultValues: {
      project: projectName,
      material_request_type: 'Material Request',
      transaction_date: new Date().toISOString().slice(0, 10),
      schedule_date: new Date().toISOString().slice(0, 10),
      item_code: '',
      qty: 1,
      description: '',
    },
  })

  const onSubmit: SubmitHandler<MaterialRequestFormValues> = async (values) => {
    try {
      await createRequest.mutateAsync(values)
      reset({ ...values, item_code: '', qty: 1, description: '' })
    } catch (err) {
      const message = err instanceof ApiError ? err.serverMessage ?? err.message : 'Could not create material request.'
      alert(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Procurement</h1>
          <p className="text-sm text-gray-500">Create material requests and review procurement records for this project.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New material request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" value={projectName} {...register('project')} />

            <div className="space-y-2">
              <Label htmlFor="material_request_type">Request type</Label>
              <Input id="material_request_type" {...register('material_request_type')} />
              {errors.material_request_type && <p className="text-sm text-status-overdue">{errors.material_request_type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction date</Label>
              <Input id="transaction_date" type="date" {...register('transaction_date')} />
              {errors.transaction_date && <p className="text-sm text-status-overdue">{errors.transaction_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule_date">Schedule date</Label>
              <Input id="schedule_date" type="date" {...register('schedule_date')} />
              {errors.schedule_date && <p className="text-sm text-status-overdue">{errors.schedule_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_code">Item code</Label>
              <Input id="item_code" {...register('item_code')} />
              {errors.item_code && <p className="text-sm text-status-overdue">{errors.item_code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min={1} {...register('qty', { valueAsNumber: true })} />
              {errors.qty && <p className="text-sm text-status-overdue">{errors.qty.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} />
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting || createRequest.status === 'pending'}>
                {createRequest.status === 'pending' ? 'Creating...' : 'Create request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Procurement records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading procurement...
            </div>
          ) : error ? (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
              Could not load procurement records.
            </div>
          ) : procurement?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Supplier</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {procurement.map((record) => (
                    <tr key={record.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{record.doctype}</td>
                      <td className="py-3 pr-4 text-gray-700">{record.supplier || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{record.transaction_date || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">${(record.rounded_total ?? 0).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-gray-700">{record.status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No procurement records found for this project.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
