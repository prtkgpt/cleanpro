import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { successResponse, handleApiError } from '@/lib/utils/api-response'

// GET /api/services - List all services
export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const workspaceId = await getWorkspaceId()

    const services = await prisma.service.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    return successResponse(services)
  } catch (error) {
    return handleApiError(error)
  }
}
