import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useBudgetVariance, useProfitabilitySummary, useRequestAging } from './hooks'
import type { ProjectVarianceRecord, RequestAgingRecord } from './types'

const reportViews = ['Profitability', 'Budget Variance', 'Request Aging'] as const

type ReportView = (typeof reportViews)[number]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function renderVarianceRow(record: ProjectVarianceRecord) {
  return (
    <tr key={record.name} className="border-t border-surface-border">
      <td className="p-3 text-sm text-gray-700">{record.project_name || record.name}</td>
      <td className="p-3 text-sm text-gray-700">{formatCurrency(record.total_billed_amount ?? 0)}</td>
      <td className="p-3 text-sm text-gray-700">{formatCurrency(record.total_costing_amount ?? 0)}</td>
      <td className="p-3 text-sm text-gray-700">{Math.round(record.gross_margin ?? 0)}%</td>
    </tr>
  )
}

function renderAgingRow(record: RequestAgingRecord) {
  return (
    <tr key={record.name} className="border-t border-surface-border">
      <td className="p-3 text-sm text-gray-700">{record.name}</td>
      <td className="p-3 text-sm text-gray-700">{record.status ?? 'Unknown'}</td>
      <td className="p-3 text-sm text-gray-700">{record.project ?? 'N/A'}</td>
      <td className="p-3 text-sm text-gray-700">{record.creation ? new Date(record.creation).toLocaleDateString() : 'Unknown'}</td>
    </tr>
  )
}

function downloadExcel(filename: string, sheetName: string, headers: string[], rows: Array<Array<string | number>>) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

function downloadPdf(filename: string, title: string, headers: string[], rows: Array<Array<string | number>>) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(14)
  doc.text(title, 14, 16)
  autoTable(doc, {
    startY: 24,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
  })
  doc.save(filename)
}

export function ReportsPage() {
  const [activeView, setActiveView] = useState<ReportView>('Profitability')
  const profitability = useProfitabilitySummary()
  const budgetVariance = useBudgetVariance()
  const requestAging = useRequestAging()

  const hasProfitability = !profitability.isLoading && !profitability.isError && Boolean(profitability.data)
  const hasBudgetVariance = Boolean(budgetVariance.data?.length)
  const hasRequestAging = Boolean(requestAging.data?.length)

  const exportEnabled =
    (activeView === 'Profitability' && hasProfitability) ||
    (activeView === 'Budget Variance' && hasBudgetVariance) ||
    (activeView === 'Request Aging' && hasRequestAging)

  const exportEnabledExcel = exportEnabled
  const exportEnabledPdf = exportEnabled

  function getExportFileName(extension: string) {
    return `${activeView.toLowerCase().replace(/\s+/g, '-')}.${extension}`
  }

  function exportView(format: 'excel' | 'pdf') {
    if (activeView === 'Profitability' && profitability.data) {
      const headers = ['Metric', 'Value']
      const rows = [
        ['Revenue', formatCurrency(profitability.data.totalRevenue)],
        ['Cost', formatCurrency(profitability.data.totalCost)],
        ['Gross margin', `${Math.round(profitability.data.grossMargin)}%`],
      ]

      if (format === 'excel') {
        downloadExcel(getExportFileName('xlsx'), 'Profitability', headers, rows)
      } else {
        downloadPdf(getExportFileName('pdf'), 'Profitability Summary', headers, rows)
      }
      return
    }

    if (activeView === 'Budget Variance' && budgetVariance.data) {
      const headers = ['Project', 'Revenue', 'Cost', 'Gross margin']
      const rows = budgetVariance.data.map((record) => [
        record.project_name || record.name,
        formatCurrency(record.total_billed_amount ?? 0),
        formatCurrency(record.total_costing_amount ?? 0),
        `${Math.round(record.gross_margin ?? 0)}%`,
      ])

      if (format === 'excel') {
        downloadExcel(getExportFileName('xlsx'), 'Budget Variance', headers, rows)
      } else {
        downloadPdf(getExportFileName('pdf'), 'Budget Variance Details', headers, rows)
      }
      return
    }

    if (activeView === 'Request Aging' && requestAging.data) {
      const headers = ['Request', 'Status', 'Project', 'Created']
      const rows = requestAging.data.map((record) => [
        record.name,
        record.status ?? 'Unknown',
        record.project ?? 'N/A',
        record.creation ? new Date(record.creation).toLocaleDateString() : 'Unknown',
      ])

      if (format === 'excel') {
        downloadExcel(getExportFileName('xlsx'), 'Request Aging', headers, rows)
      } else {
        downloadPdf(getExportFileName('pdf'), 'Request Aging', headers, rows)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Reports</h1>
          <p className="text-sm text-gray-500">View financial performance, budget variance, and request aging across your projects.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportView('excel')} disabled={!exportEnabledExcel}>
              <FileSpreadsheet size={16} /> Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportView('pdf')} disabled={!exportEnabledPdf}>
              <FileText size={16} /> Export PDF
            </Button>
          </div>
          <p className="text-sm text-gray-500">Export the current report view directly to Excel or PDF.</p>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ReportView)}>
        <TabsList>
          {reportViews.map((view) => (
            <TabsTrigger key={view} value={view}>{view}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Profitability">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profitability summary</CardTitle>
            </CardHeader>
            <CardContent>
              {profitability.isLoading ? (
                <p className="text-sm text-gray-500">Loading profitability metrics...</p>
              ) : profitability.isError ? (
                <p className="text-sm text-red-600">Unable to load profitability data.</p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-surface-border bg-white p-4">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="mt-2 text-3xl font-semibold text-brand-900">{formatCurrency(profitability.data?.totalRevenue ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border border-surface-border bg-white p-4">
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="mt-2 text-3xl font-semibold text-brand-900">{formatCurrency(profitability.data?.totalCost ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border border-surface-border bg-white p-4">
                    <p className="text-sm text-gray-500">Gross margin</p>
                    <p className="mt-2 text-3xl font-semibold text-brand-900">{Math.round(profitability.data?.grossMargin ?? 0)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Budget Variance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget variance details</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetVariance.isLoading ? (
                <p className="text-sm text-gray-500">Loading budget variance data...</p>
              ) : budgetVariance.isError ? (
                <p className="text-sm text-red-600">Unable to load budget variance data.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-surface-border bg-white">
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Project</th>
                        <th className="px-3 py-2">Revenue</th>
                        <th className="px-3 py-2">Cost</th>
                        <th className="px-3 py-2">Gross margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetVariance.data?.map(renderVarianceRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Request Aging">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request aging</CardTitle>
            </CardHeader>
            <CardContent>
              {requestAging.isLoading ? (
                <p className="text-sm text-gray-500">Loading request aging details...</p>
              ) : requestAging.isError ? (
                <p className="text-sm text-red-600">Unable to load request aging details.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-surface-border bg-white">
                  <table className="min-w-full text-left text-sm text-gray-700">
                    <thead className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Request</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Project</th>
                        <th className="px-3 py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestAging.data?.map(renderAgingRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
