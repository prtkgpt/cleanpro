import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-500">Welcome to CleanPro CRM</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-gray-500">+20% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <span className="text-2xl">📋</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-gray-500">From seed data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-gray-500">Jane & Bob</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cleaners</CardTitle>
              <span className="text-2xl">🧹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-gray-500">Maria & John</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/bookings/new"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mr-4">➕</span>
                <div>
                  <div className="font-medium">New Booking</div>
                  <div className="text-sm text-gray-500">Schedule a cleaning job</div>
                </div>
              </a>

              <a
                href="/customers/new"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mr-4">👤</span>
                <div>
                  <div className="font-medium">New Customer</div>
                  <div className="text-sm text-gray-500">Add a customer</div>
                </div>
              </a>

              <a
                href="/calendar"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl mr-4">📅</span>
                <div>
                  <div className="font-medium">View Calendar</div>
                  <div className="text-sm text-gray-500">See all bookings</div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl mr-4">📋</span>
                <div className="flex-1">
                  <div className="font-medium">New booking created</div>
                  <div className="text-sm text-gray-500">Jane Doe - Standard Cleaning - Tomorrow 9:00 AM</div>
                </div>
                <div className="text-sm text-gray-500">Today</div>
              </div>

              <div className="flex items-center">
                <span className="text-2xl mr-4">👤</span>
                <div className="flex-1">
                  <div className="font-medium">New customer added</div>
                  <div className="text-sm text-gray-500">Bob Johnson</div>
                </div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
