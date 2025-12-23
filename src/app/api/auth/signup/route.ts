import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db/prisma'
import { signUpSchema } from '@/lib/validators/auth'
import {
  successResponse,
  handleApiError,
  conflictResponse,
} from '@/lib/utils/api-response'
import { UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = signUpSchema.parse(body)

    // Check if workspace slug already exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: validatedData.workspaceSlug },
    })

    if (existingWorkspace) {
      return conflictResponse('Workspace slug already taken')
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return conflictResponse('Email already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create workspace and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: validatedData.workspaceName,
          slug: validatedData.workspaceSlug,
        },
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          phone: validatedData.phone,
          role: UserRole.ADMIN,
          workspaceId: workspace.id,
        },
      })

      return { workspace, user }
    })

    // Don't return sensitive data
    const { password: _, ...userWithoutPassword } = result.user

    return successResponse({
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
      },
      user: userWithoutPassword,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
