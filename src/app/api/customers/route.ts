import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { createCustomerSchema } from '@/lib/validators/customer'
import {
  successResponse,
  handleApiError,
} from '@/lib/utils/api-response'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

// GET /api/customers - List all customers
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_customers')

    const workspaceId = await getWorkspaceId()
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []

    const where = {
      workspaceId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tags.length > 0 && {
        tags: { hasSome: tags },
      }),
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          addresses: true,
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ])

    return successResponse(customers, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/customers - Create new customer
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_customers')

    const workspaceId = await getWorkspaceId()
    const body = await req.json()
    const validatedData = createCustomerSchema.parse(body)

    // Check if email already exists in this workspace
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        workspaceId,
        email: validatedData.email.toLowerCase(),
      },
    })

    if (existingCustomer) {
      return handleApiError(new Error('Customer with this email already exists'))
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create customer with user account in transaction
    const customer = await prisma.$transaction(async (tx) => {
      // Create user account
      const user = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          phone: validatedData.phone,
          role: UserRole.CUSTOMER,
          workspaceId,
        },
      })

      // Create customer profile
      const newCustomer = await tx.customer.create({
        data: {
          userId: user.id,
          workspaceId,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email.toLowerCase(),
          phone: validatedData.phone,
          tags: validatedData.tags || [],
          source: validatedData.source,
          notes: validatedData.notes,
        },
      })

      // Create address if provided
      if (validatedData.address) {
        await tx.address.create({
          data: {
            customerId: newCustomer.id,
            ...validatedData.address,
            isDefault: true,
          },
        })
      }

      return newCustomer
    })

    // Fetch complete customer with relations
    const customerWithRelations = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        addresses: true,
      },
    })

    return successResponse(customerWithRelations)
  } catch (error) {
    return handleApiError(error)
  }
}
