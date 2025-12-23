import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { BookingStatus } from '@prisma/client'

// GET /api/bookings/[id] - Get single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
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
    })

    if (!booking) {
      return handleApiError(new Error('Booking not found'))
    }

    return successResponse(booking)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/bookings/[id] - Update booking
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()

    // Verify booking belongs to workspace
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        workspaceId,
      },
    })

    if (!existingBooking) {
      return handleApiError(new Error('Booking not found'))
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status as BookingStatus }),
        ...(body.scheduledDate && { scheduledDate: new Date(body.scheduledDate) }),
        ...(body.scheduledTime && { scheduledTime: body.scheduledTime }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.specialInstructions !== undefined && { specialInstructions: body.specialInstructions }),
        ...(body.completedAt && { completedAt: new Date(body.completedAt) }),
      },
      include: {
        customer: true,
        service: true,
        address: true,
        assignments: {
          include: {
            cleaner: true,
          },
        },
      },
    })

    return successResponse(updatedBooking)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()

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

    // Delete booking (cascade will handle assignments)
    await prisma.booking.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Booking deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
