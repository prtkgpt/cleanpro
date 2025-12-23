'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CalendarBooking {
  id: string
  scheduledDate: string
  scheduledTime: string
  customer: {
    firstName: string
    lastName: string
  }
  service: {
    name: string
  }
  assignments: Array<{
    cleaner: {
      firstName: string
      color: string
    }
  }>
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - startDate.getDay()) // Start of week

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6) // End of week

    fetch(`/api/calendar?view=week&date=${startDate.toISOString().split('T')[0]}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookings(data.data.bookings)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentDate])

  const getDayBookings = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(b => b.scheduledDate.startsWith(dateStr))
  }

  const weekDays = []
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(day.getDate() + i)
    weekDays.push(day)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading calendar...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
            <p className="text-gray-500">View all scheduled cleanings</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const prev = new Date(currentDate)
                prev.setDate(prev.getDate() - 7)
                setCurrentDate(prev)
              }}
            >
              ← Previous Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const next = new Date(currentDate)
                next.setDate(next.getDate() + 7)
                setCurrentDate(next)
              }}
            >
              Next Week →
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Week of {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayBookings = getDayBookings(day)
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 min-h-[200px] ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold mb-2">
                      <div className="text-sm text-gray-500">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={isToday ? 'text-blue-600' : ''}>
                        {day.getDate()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-2 rounded text-xs bg-white border border-gray-200 hover:shadow-sm transition-shadow"
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: booking.assignments[0]?.cleaner.color || '#3b82f6'
                          }}
                        >
                          <div className="font-medium">{booking.scheduledTime}</div>
                          <div className="text-gray-600">
                            {booking.customer.firstName} {booking.customer.lastName}
                          </div>
                          <div className="text-gray-500 mt-1">{booking.service.name}</div>
                          {booking.assignments[0] && (
                            <div className="text-gray-500 mt-1">
                              👤 {booking.assignments[0].cleaner.firstName}
                            </div>
                          )}
                        </div>
                      ))}

                      {dayBookings.length === 0 && (
                        <div className="text-gray-400 text-xs text-center mt-4">
                          No bookings
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
