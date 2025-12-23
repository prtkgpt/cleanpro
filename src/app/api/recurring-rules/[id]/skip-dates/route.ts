import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'

// POST /api/recurring-rules/[id]/skip-dates - Add a skip date
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()

    // Verify rule belongs to workspace
    const rule = await prisma.recurringRule.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!rule) {
      return handleApiError(new Error('Recurring rule not found'))
    }

    // Create skip date
    const skipDate = await prisma.recurringSkipDate.create({
      data: {
        recurringRuleId: params.id,
        skipDate: new Date(body.skipDate),
        reason: body.reason,
      },
    })

    // Delete any existing booking for this date if auto-generated
    const dateToSkip = new Date(body.skipDate)
    await prisma.booking.deleteMany({
      where: {
        recurringRuleId: params.id,
        scheduledDate: {
          gte: new Date(dateToSkip.setHours(0, 0, 0, 0)),
          lt: new Date(dateToSkip.setHours(23, 59, 59, 999)),
        },
        status: 'CONFIRMED', // Only delete confirmed, not completed bookings
      },
    })

    return successResponse(skipDate)
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/recurring-rules/[id]/skip-dates - List skip dates
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()

    // Verify rule belongs to workspace
    const rule = await prisma.recurringRule.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!rule) {
      return handleApiError(new Error('Recurring rule not found'))
    }

    const skipDates = await prisma.recurringSkipDate.findMany({
      where: { recurringRuleId: params.id },
      orderBy: { skipDate: 'asc' },
    })

    return successResponse(skipDates)
  } catch (error) {
    return handleApiError(error)
  }
}
