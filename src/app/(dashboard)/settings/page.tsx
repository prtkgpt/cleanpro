'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-gray-500">Manage your workspace and preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="Your cleaning business name" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input id="businessEmail" type="email" placeholder="contact@yourbusiness.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input id="businessPhone" type="tel" placeholder="(555) 123-4567" disabled />
              </div>
              <div className="text-sm text-gray-400">Business settings coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Booking Duration (minutes)</Label>
                <Input id="defaultDuration" type="number" placeholder="120" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bufferTime">Buffer Time Between Bookings (minutes)</Label>
                <Input id="bufferTime" type="number" placeholder="30" disabled />
              </div>
              <div className="flex items-center space-x-2">
                <input id="autoConfirm" type="checkbox" disabled />
                <Label htmlFor="autoConfirm">Auto-confirm new bookings</Label>
              </div>
              <div className="text-sm text-gray-400">Booking settings coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input id="emailBooking" type="checkbox" disabled />
                <Label htmlFor="emailBooking">Email notifications for new bookings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input id="emailReminder" type="checkbox" disabled />
                <Label htmlFor="emailReminder">Send booking reminders to customers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input id="smsNotifications" type="checkbox" disabled />
                <Label htmlFor="smsNotifications">SMS notifications</Label>
              </div>
              <div className="text-sm text-gray-400">Notification settings coming soon...</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input id="taxRate" type="number" placeholder="8.0" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select id="currency" className="w-full px-3 py-2 border rounded-md" disabled>
                  <option>USD - US Dollar</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">Payment settings coming soon...</div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button disabled>Save Settings</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
