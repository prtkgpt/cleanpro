import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { createBookingSchema } from '@/lib/validators/booking'
import {
  successResponse,
  handleApiError,
} from '@/lib/utils/api-response'
import { BookingStatus, InvoiceStatus } from '@prisma/client'

// GET /api/bookings - List bookings
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') as BookingStatus | null
    const customerId = searchParams.get('customerId')
    const cleanerId = searchParams.get('cleanerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'scheduledDate'
    const order = searchParams.get('order') || 'asc'

    const where = {
      workspaceId,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(cleanerId && {
        assignments: {
          some: { cleanerId },
        },
      }),
      ...(startDate &&
        endDate && {
          scheduledDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.booking.count({ where }),
    ])

    return successResponse(bookings, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_bookings')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()
    const validatedData = createBookingSchema.parse(body)

    // Verify customer belongs to workspace
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        workspaceId,
      },
    })

    if (!customer) {
      return handleApiError(new Error('Customer not found'))
    }

    // Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: {
        id: validatedData.addressId,
        customerId: validatedData.customerId,
      },
    })

    if (!address) {
      return handleApiError(new Error('Address not found'))
    }

    // Get service details for pricing
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        workspaceId,
      },
    })

    if (!service) {
      return handleApiError(new Error('Service not found'))
    }

    // Calculate pricing (simplified - could be in a pricing service)
    let total = service.basePrice

    // Add per-sqft pricing if applicable
    if (service.pricingModel === 'PER_SQFT' && address.squareFeet && service.pricePerSqft) {
      total = address.squareFeet * service.pricePerSqft
    }

    // Add per-bedroom pricing if applicable
    if (service.pricingModel === 'PER_BEDROOM' && address.bedrooms && service.pricePerBedroom) {
      total = address.bedrooms * service.pricePerBedroom
    }

    const subtotal = total
    const tax = subtotal * 0.08 // 8% tax (should be configurable)

    total = subtotal + tax

    // Create booking and invoice in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          workspaceId,
          customerId: validatedData.customerId,
          addressId: validatedData.addressId,
          serviceId: validatedData.serviceId,
          scheduledDate: new Date(validatedData.scheduledDate),
          scheduledTime: validatedData.scheduledTime,
          durationMinutes: service.estimatedMinutes,
          status: BookingStatus.CONFIRMED,
          subtotal,
          tax,
          total,
          notes: validatedData.notes,
          specialInstructions: validatedData.specialInstructions,
        },
      })

      // Create checklist from service template
      if (service.checklistTemplate) {
        const checklistItems = service.checklistTemplate as any[]
        await Promise.all(
          checklistItems.map((item, index) =>
            tx.checklistItem.create({
              data: {
                bookingId: booking.id,
                title: item.title,
                description: item.description,
                sortOrder: index,
              },
            })
          )
        )
      }

      // Create invoice if requested
      let invoice = null
      if (validatedData.createInvoice) {
        // Generate invoice number
        const invoiceCount = await tx.invoice.count({ where: { workspaceId } })
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
          invoiceCount + 1
        ).padStart(4, '0')}`

        invoice = await tx.invoice.create({
          data: {
            workspaceId,
            bookingId: booking.id,
            customerId: validatedData.customerId,
            invoiceNumber,
            subtotal,
            tax,
            total,
            status: InvoiceStatus.PENDING,
            dueDate: new Date(validatedData.scheduledDate),
          },
        })
      }

      return { booking, invoice }
    })

    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
