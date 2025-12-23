import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { RecurringFrequency } from '@prisma/client'

// GET /api/recurring-rules - List all recurring rules
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    const where = {
      workspaceId,
      ...(customerId && { customerId }),
    }

    const rules = await prisma.recurringRule.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        address: {
          select: {
            street: true,
            city: true,
            state: true,
          },
        },
        service: {
          select: {
            name: true,
            basePrice: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            skipDates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(rules)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/recurring-rules - Create new recurring rule
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()

    // Validate customer belongs to workspace
    const customer = await prisma.customer.findFirst({
      where: {
        id: body.customerId,
        workspaceId,
      },
    })

    if (!customer) {
      return handleApiError(new Error('Customer not found'))
    }

    // Validate address belongs to customer
    const address = await prisma.address.findFirst({
      where: {
        id: body.addressId,
        customerId: body.customerId,
      },
    })

    if (!address) {
      return handleApiError(new Error('Address not found'))
    }

    // Validate service
    const service = await prisma.service.findFirst({
      where: {
        id: body.serviceId,
        workspaceId,
      },
    })

    if (!service) {
      return handleApiError(new Error('Service not found'))
    }

    // Create recurring rule
    const rule = await prisma.recurringRule.create({
      data: {
        workspaceId,
        customerId: body.customerId,
        addressId: body.addressId,
        serviceId: body.serviceId,
        frequency: body.frequency as RecurringFrequency,
        interval: body.interval || 1,
        dayOfWeek: body.dayOfWeek,
        dayOfMonth: body.dayOfMonth,
        preferredTime: body.preferredTime,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: true,
      },
      include: {
        customer: true,
        address: true,
        service: true,
      },
    })

    return successResponse(rule)
  } catch (error) {
    return handleApiError(error)
  }
}
