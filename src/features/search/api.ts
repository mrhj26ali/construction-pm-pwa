import { apiRequest } from '@/lib/apiClient'
import type { GlobalSearchResult } from './types'

export async function searchGlobal(query: string): Promise<GlobalSearchResult[]> {
  const encoded = encodeURIComponent(query)
  const res = await apiRequest<{ message?: { results?: Array<Record<string, any>> } }>(
    `/method/frappe.utils.global_search?txt=${encoded}&limit=20`
  )

  const rawResults = res.message?.results ?? []
  return rawResults.map((item) => ({
    title: item.title ?? item.name ?? item.value ?? 'Untitled',
    description: item.description ?? item.subtitle ?? '',
    doctype: item.doctype ?? item.type ?? 'Unknown',
    name: item.name ?? item.value ?? '',
  }))
}
