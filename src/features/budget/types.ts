export interface BudgetRecord {
  name: string
  project?: string
  cost_center: string
  budget_type?: string
  budget_amount: number
  fiscal_year?: string
}

export interface ProjectReference {
  name: string
  project_name: string
}

export interface CreateBudgetPayload {
  project?: string
  cost_center: string
  budget_type?: string
  budget_amount: number
  fiscal_year?: string
}

export interface ProjectVarianceRecord {
  name: string
  project_name: string
  total_costing_amount?: number
  total_billed_amount?: number
  total_billing_amount?: number
  gross_margin?: number
}

export interface ProcurementRecord {
  name: string
  status?: string
  transaction_date?: string
  schedule_date?: string
  supplier?: string
  grand_total?: number
  rounded_total?: number
  project?: string
  material_request_type?: string
  doctype: string
}

export interface CreateMaterialRequestPayload {
  project: string
  material_request_type: string
  transaction_date: string
  schedule_date: string
  item_code: string
  qty: number
  description?: string
}
