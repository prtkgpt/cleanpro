import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  return NextResponse.json({
    hasSession: !!session,
    session: session,
    env: {
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    }
  })
}
