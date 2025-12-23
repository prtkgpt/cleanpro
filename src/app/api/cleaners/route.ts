import { NextRequest } from 'next/server'
import prisma from '@/lib/db/prisma'
import { requireAuth, getWorkspaceId } from '@/lib/auth/session'
import { requirePermission } from '@/lib/auth/permissions'
import { successResponse, handleApiError } from '@/lib/utils/api-response'

// GET /api/cleaners - List all cleaners
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    requirePermission(session, 'manage_cleaners')

    const workspaceId = await getWorkspaceId()

    const cleaners = await prisma.cleaner.findMany({
      where: { workspaceId },
      orderBy: { firstName: 'asc' },
    })

    return successResponse(cleaners)
  } catch (error) {
    return handleApiError(error)
  }
}
