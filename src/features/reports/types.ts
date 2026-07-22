export interface ProfitabilitySummary {
  totalRevenue: number
  totalCost: number
  grossMargin: number
}

export interface ProjectVarianceRecord {
  name: string
  project_name: string
  total_costing_amount?: number
  total_billed_amount?: number
  gross_margin?: number
}

export interface RequestAgingRecord {
  name: string
  status?: string
  creation?: string
  project?: string
}
