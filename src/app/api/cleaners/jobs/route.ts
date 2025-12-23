import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getUserId } from '@/lib/auth/session'
import { isCleaner } from '@/lib/auth/permissions'
import { successResponse, handleApiError, forbiddenResponse } from '@/lib/utils/api-response'
import { startOfDay, endOfDay } from 'date-fns'

// GET /api/cleaners/jobs - Get jobs for current cleaner
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()

    if (!isCleaner(session)) {
      return forbiddenResponse()
    }

    const userId = await getUserId()
    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') || 'today' // today, upcoming, past

    // Get cleaner record from user
    const cleaner = await prisma.cleaner.findUnique({
      where: { userId },
    })

    if (!cleaner) {
      return handleApiError(new Error('Cleaner profile not found'))
    }

    let dateFilter = {}
    const today = new Date()

    switch (view) {
      case 'today':
        dateFilter = {
          scheduledDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        }
        break
      case 'upcoming':
        dateFilter = {
          scheduledDate: {
            gt: endOfDay(today),
          },
        }
        break
      case 'past':
        dateFilter = {
          scheduledDate: {
            lt: startOfDay(today),
          },
        }
        break
    }

    // Fetch bookings assigned to this cleaner
    const assignments = await prisma.cleanerAssignment.findMany({
      where: {
        cleanerId: cleaner.id,
        booking: dateFilter,
      },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            address: true,
            service: {
              select: {
                id: true,
                name: true,
                type: true,
                estimatedMinutes: true,
              },
            },
            checklist: {
              orderBy: { sortOrder: 'asc' },
            },
            photos: true,
          },
        },
      },
      orderBy: [
        { booking: { scheduledDate: 'asc' } },
        { booking: { scheduledTime: 'asc' } },
      ],
    })

    // Transform to cleaner-friendly format
    const jobs = assignments.map((assignment) => ({
      id: assignment.booking.id,
      scheduledDate: assignment.booking.scheduledDate,
      scheduledTime: assignment.booking.scheduledTime,
      status: assignment.booking.status,
      customer: assignment.booking.customer,
      address: assignment.booking.address,
      service: assignment.booking.service,
      notes: assignment.booking.notes,
      specialInstructions: assignment.booking.specialInstructions,
      checklist: assignment.booking.checklist,
      photos: assignment.booking.photos,
      assignment: {
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        minutesWorked: assignment.minutesWorked,
      },
    }))

    return successResponse(jobs)
  } catch (error) {
    return handleApiError(error)
  }
}
