import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'

// POST /api/bookings/[id]/assign - Assign cleaners to booking
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()
    const { cleanerIds } = body

    if (!Array.isArray(cleanerIds)) {
      return handleApiError(new Error('cleanerIds must be an array'))
    }

    // Verify booking belongs to workspace
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!booking) {
      return handleApiError(new Error('Booking not found'))
    }

    // Verify all cleaners belong to workspace
    const cleaners = await prisma.cleaner.findMany({
      where: {
        id: { in: cleanerIds },
        workspaceId,
      },
    })

    if (cleaners.length !== cleanerIds.length) {
      return handleApiError(new Error('One or more cleaners not found'))
    }

    // Delete existing assignments
    await prisma.cleanerAssignment.deleteMany({
      where: { bookingId: params.id },
    })

    // Create new assignments
    if (cleanerIds.length > 0) {
      await prisma.cleanerAssignment.createMany({
        data: cleanerIds.map((cleanerId: string) => ({
          bookingId: params.id,
          cleanerId,
        })),
      })
    }

    // Fetch updated booking with assignments
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
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
    })

    return successResponse(updatedBooking)
  } catch (error) {
    return handleApiError(error)
  }
}
