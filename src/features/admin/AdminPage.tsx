import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UsersPage } from './UsersPage'

export function AdminPage() {
  return (
    <div className="space-y-6">
      <UsersPage />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles & Permissions</CardTitle>
          <CardDescription>
            Managed through ERPNext's native permission manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/app/role-permission-manager" target="_blank" rel="noopener noreferrer">
              Open Role Permission Manager <ExternalLink size={14} className="ml-1.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}