'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-gray-500">Business analytics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Track revenue by period, service, and customer</p>
              <div className="mt-4 text-sm text-gray-400">Coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Analyze booking trends and patterns</p>
              <div className="mt-4 text-sm text-gray-400">Coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cleaner Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Track cleaner metrics and efficiency</p>
              <div className="mt-4 text-sm text-gray-400">Coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Customer lifetime value and retention</p>
              <div className="mt-4 text-sm text-gray-400">Coming soon...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
