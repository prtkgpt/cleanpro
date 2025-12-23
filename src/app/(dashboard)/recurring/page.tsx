'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface RecurringRule {
  id: string
  frequency: string
  interval: number
  dayOfWeek?: number
  dayOfMonth?: number
  preferredTime: string
  startDate: string
  endDate?: string
  isActive: boolean
  isPaused: boolean
  customer: {
    firstName: string
    lastName: string
  }
  address: {
    street: string
    city: string
  }
  service: {
    name: string
    basePrice: number
  }
  _count: {
    bookings: number
    skipDates: number
  }
}

export default function RecurringRulesPage() {
  const [rules, setRules] = useState<RecurringRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recurring-rules')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRules(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getFrequencyLabel = (rule: RecurringRule) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    switch (rule.frequency) {
      case 'WEEKLY':
        return `Weekly on ${rule.dayOfWeek !== undefined ? dayNames[rule.dayOfWeek] : 'N/A'}`
      case 'BIWEEKLY':
        return `Bi-weekly on ${rule.dayOfWeek !== undefined ? dayNames[rule.dayOfWeek] : 'N/A'}`
      case 'MONTHLY':
        return `Monthly on day ${rule.dayOfMonth}`
      default:
        return rule.frequency
    }
  }

  async function togglePause(ruleId: string, currentlyPaused: boolean) {
    try {
      const response = await fetch(`/api/recurring-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: !currentlyPaused }),
      })

      if (response.ok) {
        // Refresh rules
        const res = await fetch('/api/recurring-rules')
        const data = await res.json()
        if (data.success) {
          setRules(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error)
    }
  }

  async function generateBookings(ruleId: string) {
    try {
      const response = await fetch(`/api/recurring-rules/${ruleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeksAhead: 12 }),
      })

      const data = await response.json()
      if (data.success) {
        alert(`Generated ${data.data.created} bookings`)
        // Refresh rules to update booking count
        const res = await fetch('/api/recurring-rules')
        const rulesData = await res.json()
        if (rulesData.success) {
          setRules(rulesData.data)
        }
      }
    } catch (error) {
      console.error('Failed to generate bookings:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading recurring schedules...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Recurring Schedules</h2>
            <p className="text-gray-500">Manage automatic recurring cleaning services</p>
          </div>
          <Link href="/recurring/new">
            <Button>+ New Recurring Schedule</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Recurring Schedules ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No recurring schedules yet.</p>
                <Link href="/recurring/new">
                  <Button>Create Your First Recurring Schedule</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {rule.customer.firstName} {rule.customer.lastName}
                      </TableCell>
                      <TableCell>{rule.service.name}</TableCell>
                      <TableCell>
                        {rule.address.street}, {rule.address.city}
                      </TableCell>
                      <TableCell>{getFrequencyLabel(rule)}</TableCell>
                      <TableCell>{rule.preferredTime}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{rule._count.bookings} bookings</div>
                          {rule._count.skipDates > 0 && (
                            <div className="text-gray-500">{rule._count.skipDates} skipped</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded ${
                          rule.isPaused
                            ? 'bg-yellow-100 text-yellow-700'
                            : rule.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.isPaused ? 'Paused' : rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePause(rule.id, rule.isPaused)}
                          >
                            {rule.isPaused ? 'Resume' : 'Pause'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateBookings(rule.id)}
                          >
                            Generate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
