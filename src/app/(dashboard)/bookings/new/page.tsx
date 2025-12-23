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
  estimatedMinutes: number
}

export default function NewBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerId: '',
    addressId: '',
    serviceId: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    notes: '',
    specialInstructions: '',
    createInvoice: true,
  })

  useEffect(() => {
    // Fetch customers and services
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([customersRes, servicesRes]) => {
      if (customersRes.success) setCustomers(customersRes.data)
      if (servicesRes.success) setServices(servicesRes.data)
    })
  }, [])

  const selectedCustomer = customers.find(c => c.id === formData.customerId)
  const selectedService = services.find(s => s.id === formData.serviceId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to create booking')
        setLoading(false)
        return
      }

      router.push('/bookings')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Booking</h2>
          <p className="text-gray-500">Schedule a new cleaning job</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
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
                      {service.name} - ${service.basePrice} ({service.estimatedMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Internal notes (not visible to customer)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <textarea
                  id="specialInstructions"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Special instructions for cleaners"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                />
              </div>

              {/* Create Invoice */}
              <div className="flex items-center space-x-2">
                <input
                  id="createInvoice"
                  type="checkbox"
                  checked={formData.createInvoice}
                  onChange={(e) => setFormData({ ...formData, createInvoice: e.target.checked })}
                />
                <Label htmlFor="createInvoice">Create invoice for this booking</Label>
              </div>

              {/* Price Preview */}
              {selectedService && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span>Service:</span>
                    <span className="font-medium">${selectedService.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (8%):</span>
                    <span className="font-medium">${(selectedService.basePrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${(selectedService.basePrice * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Booking'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/bookings')}
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
