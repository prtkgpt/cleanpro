import { NextRequest } from 'next/server'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { generateRecurringBookings } from '@/lib/services/recurring-bookings'

// POST /api/recurring-rules/[id]/generate - Generate bookings from this rule
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    await getWorkspaceId() // Verify auth

    const body = await req.json()
    const weeksAhead = body.weeksAhead || 12

    const result = await generateRecurringBookings(params.id, weeksAhead)

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
