import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  let dbUser = null
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, workspaceId: true, role: true }
    })
  }

  return NextResponse.json({
    hasSession: !!session,
    session: session,
    dbUser: dbUser,
    sessionWorkspaceId: session?.user?.workspaceId,
    dbWorkspaceId: dbUser?.workspaceId,
    workspaceMatch: session?.user?.workspaceId === dbUser?.workspaceId,
    env: {
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    }
  })
}
