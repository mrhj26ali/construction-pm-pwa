import { useMemo } from 'react'
import { useBudgetVariance } from './hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function BudgetVarianceView() {
  const { data: variances, isLoading, error } = useBudgetVariance()

  const totals = useMemo(
    () => ({
      totalCosting: variances?.reduce((sum, item) => sum + (item.total_costing_amount ?? 0), 0) ?? 0,
      totalBilled: variances?.reduce((sum, item) => sum + (item.total_billed_amount ?? 0), 0) ?? 0,
      totalGrossMargin: variances?.reduce((sum, item) => sum + (item.gross_margin ?? 0), 0) ?? 0,
    }),
    [variances]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Budget variance</h1>
          <p className="text-sm text-gray-500">Review project budget performance with cost, billed and margin totals.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total costing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-brand-900">${totals.totalCosting.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total billed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-brand-900">${totals.totalBilled.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gross margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-brand-900">${totals.totalGrossMargin.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project variance table</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading variance data...
            </div>
          ) : error ? (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
              Could not load budget variance data.
            </div>
          ) : variances?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Costing</th>
                    <th className="py-3 pr-4">Billed</th>
                    <th className="py-3 pr-4">Gross margin</th>
                  </tr>
                </thead>
                <tbody>
                  {variances.map((item) => (
                    <tr key={item.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{item.project_name || item.name}</td>
                      <td className="py-3 pr-4 text-gray-700">${(item.total_costing_amount ?? 0).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-gray-700">${(item.total_billed_amount ?? 0).toFixed(2)}</td>
                      <td className="py-3 pr-4 text-gray-700">${(item.gross_margin ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No budget variance data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
