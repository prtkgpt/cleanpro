import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getUserId } from '@/lib/auth/session'
import { isCleaner } from '@/lib/auth/permissions'
import { successResponse, handleApiError, forbiddenResponse, notFoundResponse } from '@/lib/utils/api-response'
import { BookingStatus } from '@prisma/client'

// POST /api/cleaners/jobs/[bookingId]/start
export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await requireAuth()

    if (!isCleaner(session)) {
      return forbiddenResponse()
    }

    const userId = await getUserId()
    const { bookingId } = params

    // Get cleaner record
    const cleaner = await prisma.cleaner.findUnique({
      where: { userId },
    })

    if (!cleaner) {
      return handleApiError(new Error('Cleaner profile not found'))
    }

    // Find assignment
    const assignment = await prisma.cleanerAssignment.findUnique({
      where: {
        bookingId_cleanerId: {
          bookingId,
          cleanerId: cleaner.id,
        },
      },
    })

    if (!assignment) {
      return notFoundResponse('Assignment')
    }

    // Update assignment and booking
    const startTime = new Date()

    const [updatedAssignment, updatedBooking] = await prisma.$transaction([
      prisma.cleanerAssignment.update({
        where: { id: assignment.id },
        data: { startTime },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.IN_PROGRESS,
          startedAt: startTime,
        },
      }),
    ])

    return successResponse({
      startTime: updatedAssignment.startTime,
      status: updatedBooking.status,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
