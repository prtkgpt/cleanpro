import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { RecurringFrequency } from '@prisma/client'

// GET /api/recurring-rules/[id] - Get single recurring rule
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()

    const rule = await prisma.recurringRule.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
      include: {
        customer: true,
        address: true,
        service: true,
        bookings: {
          orderBy: { scheduledDate: 'desc' },
          take: 10,
        },
        skipDates: {
          orderBy: { skipDate: 'asc' },
        },
      },
    })

    if (!rule) {
      return handleApiError(new Error('Recurring rule not found'))
    }

    return successResponse(rule)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/recurring-rules/[id] - Update recurring rule
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()

    // Verify rule belongs to workspace
    const existingRule = await prisma.recurringRule.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!existingRule) {
      return handleApiError(new Error('Recurring rule not found'))
    }

    // Update rule
    const updatedRule = await prisma.recurringRule.update({
      where: { id: params.id },
      data: {
        ...(body.frequency && { frequency: body.frequency as RecurringFrequency }),
        ...(body.interval !== undefined && { interval: body.interval }),
        ...(body.dayOfWeek !== undefined && { dayOfWeek: body.dayOfWeek }),
        ...(body.dayOfMonth !== undefined && { dayOfMonth: body.dayOfMonth }),
        ...(body.preferredTime && { preferredTime: body.preferredTime }),
        ...(body.endDate !== undefined && {
          endDate: body.endDate ? new Date(body.endDate) : null
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isPaused !== undefined && { isPaused: body.isPaused }),
      },
      include: {
        customer: true,
        address: true,
        service: true,
      },
    })

    return successResponse(updatedRule)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/recurring-rules/[id] - Delete recurring rule
export async function DELETE(
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

    // Delete rule (cascade will handle skip dates)
    await prisma.recurringRule.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Recurring rule deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
