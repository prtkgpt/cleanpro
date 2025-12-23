import { UserRole } from '@prisma/client'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: UserRole
      workspaceId: string
      workspaceName: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    workspaceId: string
    workspaceName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    workspaceId: string
    workspaceName: string
  }
}
