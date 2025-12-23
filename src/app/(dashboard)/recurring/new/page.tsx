'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Customer {
  id: string
  firstName: string
  lastName: string
  addresses: Array<{
    id: string
    street: string
    city: string
    state: string
  }>
}

interface Service {
  id: string
  name: string
  basePrice: number
}

export default function NewRecurringRulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerId: '',
    addressId: '',
    serviceId: '',
    frequency: 'WEEKLY',
    interval: 1,
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    preferredTime: '09:00',
    startDate: '',
    endDate: '',
    generateImmediately: true,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([customersRes, servicesRes]) => {
      if (customersRes.success) setCustomers(customersRes.data)
      if (servicesRes.success) setServices(servicesRes.data)
    })
  }, [])

  const selectedCustomer = customers.find(c => c.id === formData.customerId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create recurring rule
      const ruleResponse = await fetch('/api/recurring-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId,
          addressId: formData.addressId,
          serviceId: formData.serviceId,
          frequency: formData.frequency,
          interval: formData.interval,
          dayOfWeek: formData.frequency === 'WEEKLY' || formData.frequency === 'BIWEEKLY'
            ? formData.dayOfWeek
            : null,
          dayOfMonth: formData.frequency === 'MONTHLY' ? formData.dayOfMonth : null,
          preferredTime: formData.preferredTime,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
        }),
      })

      const ruleData = await ruleResponse.json()

      if (!ruleData.success) {
        setError(ruleData.error || 'Failed to create recurring rule')
        setLoading(false)
        return
      }

      // Generate initial bookings if requested
      if (formData.generateImmediately) {
        await fetch(`/api/recurring-rules/${ruleData.data.id}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeksAhead: 12 }),
        })
      }

      router.push('/recurring')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Recurring Schedule</h2>
          <p className="text-gray-500">Set up automatic recurring cleaning service</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <select
                  id="customerId"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, addressId: '' })}
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Selection */}
              {selectedCustomer && (
                <div className="space-y-2">
                  <Label htmlFor="addressId">Service Address *</Label>
                  <select
                    id="addressId"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.addressId}
                    onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
                  >
                    <option value="">Select an address...</option>
                    {selectedCustomer.addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.street}, {address.city}, {address.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service *</Label>
                <select
                  id="serviceId"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Select a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.basePrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <select
                  id="frequency"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly (Every 2 weeks)</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              {/* Day of Week (for Weekly/Biweekly) */}
              {(formData.frequency === 'WEEKLY' || formData.frequency === 'BIWEEKLY') && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week *</Label>
                  <select
                    id="dayOfWeek"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day of Month (for Monthly) */}
              {formData.frequency === 'MONTHLY' && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month *</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {/* Preferred Time */}
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time *</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  required
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              {/* End Date (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <p className="text-sm text-gray-500">Leave empty for ongoing schedule</p>
              </div>

              {/* Generate Immediately */}
              <div className="flex items-center space-x-2">
                <input
                  id="generateImmediately"
                  type="checkbox"
                  checked={formData.generateImmediately}
                  onChange={(e) => setFormData({ ...formData, generateImmediately: e.target.checked })}
                />
                <Label htmlFor="generateImmediately">Generate next 12 weeks of bookings immediately</Label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Recurring Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/recurring')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
