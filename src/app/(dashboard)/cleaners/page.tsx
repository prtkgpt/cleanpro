'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Cleaner {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  hourlyRate: number
  hireDate: string
  isActive: boolean
  color: string
}

export default function CleanersPage() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cleaners')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCleaners(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading cleaners...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cleaners</h2>
            <p className="text-gray-500">Manage your cleaning team</p>
          </div>
          <Button>Add Cleaner</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Cleaners ({cleaners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cleaners.map((cleaner) => (
                  <TableRow key={cleaner.id}>
                    <TableCell className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cleaner.color }}
                      />
                      <span className="font-medium">
                        {cleaner.firstName} {cleaner.lastName}
                      </span>
                    </TableCell>
                    <TableCell>{cleaner.email}</TableCell>
                    <TableCell>{cleaner.phone}</TableCell>
                    <TableCell>
                      {cleaner.hourlyRate ? `$${cleaner.hourlyRate.toFixed(2)}/hr` : '-'}
                    </TableCell>
                    <TableCell>
                      {cleaner.hireDate
                        ? new Date(cleaner.hireDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {cleaner.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
