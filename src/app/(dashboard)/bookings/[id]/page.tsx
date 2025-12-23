'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Booking {
  id: string
  scheduledDate: string
  scheduledTime: string
  durationMinutes: number
  status: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  specialInstructions?: string
  customer: {
    firstName: string
    lastName: string
    phone: string
  }
  address: {
    street: string
    unit?: string
    city: string
    state: string
    zip: string
  }
  service: {
    name: string
    type: string
  }
  assignments: Array<{
    id: string
    cleaner: {
      id: string
      firstName: string
      lastName: string
      color: string
    }
  }>
}

interface Cleaner {
  id: string
  firstName: string
  lastName: string
  color: string
  isActive: boolean
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedCleaners, setSelectedCleaners] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/bookings/${bookingId}`).then(r => r.json()),
      fetch('/api/cleaners').then(r => r.json()),
    ]).then(([bookingRes, cleanersRes]) => {
      if (bookingRes.success) {
        setBooking(bookingRes.data)
        setSelectedCleaners(bookingRes.data.assignments.map((a: any) => a.cleaner.id))
      }
      if (cleanersRes.success) {
        setCleaners(cleanersRes.data)
      }
      setLoading(false)
    })
  }, [bookingId])

  async function handleAssignCleaners() {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleanerIds: selectedCleaners }),
      })

      const data = await response.json()
      if (data.success) {
        // Refresh booking data
        const bookingRes = await fetch(`/api/bookings/${bookingId}`)
        const bookingData = await bookingRes.json()
        if (bookingData.success) {
          setBooking(bookingData.data)
        }
      }
    } catch (error) {
      console.error('Failed to assign cleaners:', error)
    }
    setUpdating(false)
  }

  async function handleStatusChange(newStatus: string) {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() })
        }),
      })

      const data = await response.json()
      if (data.success) {
        setBooking({ ...booking!, status: newStatus })
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading booking details...</div>
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Booking not found</div>
      </DashboardLayout>
    )
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Booking Details</h2>
            <p className="text-gray-500">
              {booking.customer.firstName} {booking.customer.lastName} - {' '}
              {new Date(booking.scheduledDate).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/bookings')}>
            ← Back to Bookings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                  <div className="flex gap-2">
                    {booking.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('CONFIRMED')}
                        disabled={updating}
                      >
                        Confirm
                      </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('IN_PROGRESS')}
                        disabled={updating}
                      >
                        Start Job
                      </Button>
                    )}
                    {booking.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange('COMPLETED')}
                        disabled={updating}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('CANCELLED')}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Service</div>
                    <div className="font-medium">{booking.service.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium">{booking.service.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">
                      {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">{booking.scheduledTime}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{booking.durationMinutes} minutes</div>
                  </div>
                </div>

                {booking.specialInstructions && (
                  <div>
                    <div className="text-sm text-gray-500">Special Instructions</div>
                    <div className="mt-1 p-3 bg-gray-50 rounded">{booking.specialInstructions}</div>
                  </div>
                )}

                {booking.notes && (
                  <div>
                    <div className="text-sm text-gray-500">Internal Notes</div>
                    <div className="mt-1 p-3 bg-yellow-50 rounded">{booking.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cleaner Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Cleaners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cleaners.filter(c => c.isActive).map((cleaner) => (
                    <label key={cleaner.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCleaners.includes(cleaner.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCleaners([...selectedCleaners, cleaner.id])
                          } else {
                            setSelectedCleaners(selectedCleaners.filter(id => id !== cleaner.id))
                          }
                        }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cleaner.color }}
                      />
                      <span>{cleaner.firstName} {cleaner.lastName}</span>
                    </label>
                  ))}
                </div>

                <Button
                  onClick={handleAssignCleaners}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Assignments'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{booking.customer.phone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Service Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>{booking.address.street}</div>
                  {booking.address.unit && <div>Unit {booking.address.unit}</div>}
                  <div>
                    {booking.address.city}, {booking.address.state} {booking.address.zip}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${booking.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${booking.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${booking.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
