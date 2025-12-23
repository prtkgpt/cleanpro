import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { Session } from 'next-auth'

export async function getCurrentSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

export async function requireAuth(): Promise<Session> {
  const session = await getCurrentSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function getWorkspaceId(): Promise<string> {
  const session = await requireAuth()
  return session.user.workspaceId
}

export async function getUserId(): Promise<string> {
  const session = await requireAuth()
  return session.user.id
}

export async function getUserRole(): Promise<string> {
  const session = await requireAuth()
  return session.user.role
}
