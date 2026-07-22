import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetSetupPage } from './BudgetSetupPage'
import { BudgetVarianceView } from './BudgetVarianceView'
import { ProcurementPage } from './ProcurementPage'
import { useProjectsList } from './hooks'

const budgetTabs = ['Setup', 'Variance', 'Procurement'] as const

type BudgetTab = (typeof budgetTabs)[number]

export function BudgetPage() {
  const [activeTab, setActiveTab] = useState<BudgetTab>('Setup')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const { data: projects, isLoading: isProjectsLoading } = useProjectsList()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Budget management</h1>
          <p className="text-sm text-gray-500">Set budgets, review variance, and manage material requests for your projects.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget navigation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {budgetTabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}

          {activeTab === 'Procurement' && (
            <div className="ml-auto flex items-center gap-3">
              <label htmlFor="budget-project" className="text-sm font-medium text-gray-600">
                Filter by project
              </label>
              <select
                id="budget-project"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                disabled={isProjectsLoading}
              >
                <option value="">All projects</option>
                {projects?.map((project) => (
                  <option key={project.name} value={project.name}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab === 'Setup' && <BudgetSetupPage />}
      {activeTab === 'Variance' && <BudgetVarianceView />}
      {activeTab === 'Procurement' && <ProcurementPage projectName={selectedProject} />}
    </div>
  )
}
