import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CleanPro CRM
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete business management for home cleaning companies
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              Manage bookings, assign cleaners, and optimize routes all in one place.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Online Payments</h3>
            <p className="text-gray-600">
              Accept payments online with Stripe. Automatic invoicing and receipts.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📲</div>
            <h3 className="text-xl font-semibold mb-2">Auto Reminders</h3>
            <p className="text-gray-600">
              Automated SMS and email reminders for customers and cleaners.
            </p>
          </div>
        </div>

        <div className="mt-20 p-8 bg-blue-600 text-white rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Everything you need to run your cleaning business</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-lg">
            <li>✓ Customer portal for self-booking</li>
            <li>✓ Cleaner app with checklists</li>
            <li>✓ Recurring schedule management</li>
            <li>✓ Payment processing & invoicing</li>
            <li>✓ SMS & email automations</li>
            <li>✓ Revenue & performance reports</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
