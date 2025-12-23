import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getUserId } from '@/lib/auth/session'
import { isCleaner } from '@/lib/auth/permissions'
import { completeJobSchema } from '@/lib/validators/booking'
import { successResponse, handleApiError, forbiddenResponse, notFoundResponse } from '@/lib/utils/api-response'
import { BookingStatus } from '@prisma/client'

// POST /api/cleaners/jobs/[bookingId]/complete
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
    const body = await req.json()
    const validatedData = completeJobSchema.parse(body)

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

    if (!assignment.startTime) {
      return handleApiError(new Error('Job must be started before completing'))
    }

    // Update assignment and booking
    const endTime = new Date()
    const minutesWorked = Math.round(
      (endTime.getTime() - assignment.startTime.getTime()) / 1000 / 60
    )

    const result = await prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.cleanerAssignment.update({
        where: { id: assignment.id },
        data: {
          endTime,
          minutesWorked,
        },
      })

      // Append notes if provided
      const existingNotes = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { notes: true },
      })

      let updatedNotes = existingNotes?.notes || ''
      if (validatedData.notes) {
        updatedNotes += `\n\n[Cleaner ${cleaner.firstName}]: ${validatedData.notes}`
      }
      if (validatedData.issues) {
        updatedNotes += `\n\n[ISSUES]: ${validatedData.issues}`
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt: endTime,
          notes: updatedNotes.trim(),
        },
      })

      return { assignment: updatedAssignment, booking: updatedBooking }
    })

    return successResponse({
      endTime: result.assignment.endTime,
      minutesWorked: result.assignment.minutesWorked,
      status: result.booking.status,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
