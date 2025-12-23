import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// GET /api/calendar - Get calendar view
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const { searchParams } = new URL(req.url)

    const view = searchParams.get('view') || 'week' // day, week, month
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const cleanerId = searchParams.get('cleanerId')

    const date = new Date(dateParam)
    let startDate: Date
    let endDate: Date

    // Calculate date range based on view
    switch (view) {
      case 'day':
        startDate = new Date(date.setHours(0, 0, 0, 0))
        endDate = new Date(date.setHours(23, 59, 59, 999))
        break
      case 'week':
        startDate = startOfWeek(date, { weekStartsOn: 0 }) // Sunday
        endDate = endOfWeek(date, { weekStartsOn: 0 })
        break
      case 'month':
        startDate = startOfMonth(date)
        endDate = endOfMonth(date)
        break
      default:
        startDate = startOfWeek(date)
        endDate = endOfWeek(date)
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where: {
        workspaceId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(cleanerId && {
          assignments: {
            some: { cleanerId },
          },
        }),
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: {
          select: {
            street: true,
            unit: true,
            city: true,
            state: true,
            zip: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignments: {
          include: {
            cleaner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    })

    // Fetch all active cleaners for the calendar view
    const cleaners = await prisma.cleaner.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        color: true,
      },
      orderBy: { firstName: 'asc' },
    })

    return successResponse({
      view,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      bookings,
      cleaners,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
