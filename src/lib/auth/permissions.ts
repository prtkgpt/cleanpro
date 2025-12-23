import { UserRole } from '@prisma/client'
import { Session } from 'next-auth'

export type Permission =
  | 'manage_workspace'
  | 'manage_billing'
  | 'manage_services'
  | 'manage_customers'
  | 'manage_bookings'
  | 'manage_cleaners'
  | 'view_reports'
  | 'manage_automations'
  | 'view_assigned_jobs'
  | 'update_assigned_jobs'
  | 'view_own_bookings'
  | 'create_bookings'

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'manage_workspace',
    'manage_billing',
    'manage_services',
    'manage_customers',
    'manage_bookings',
    'manage_cleaners',
    'view_reports',
    'manage_automations',
  ],
  DISPATCHER: [
    'manage_services',
    'manage_customers',
    'manage_bookings',
    'manage_cleaners',
    'view_reports',
  ],
  CLEANER: [
    'view_assigned_jobs',
    'update_assigned_jobs',
  ],
  CUSTOMER: [
    'view_own_bookings',
    'create_bookings',
  ],
}

export function hasPermission(
  session: Session | null,
  permission: Permission
): boolean {
  if (!session?.user?.role) return false
  const permissions = rolePermissions[session.user.role]
  return permissions.includes(permission)
}

export function requirePermission(
  session: Session | null,
  permission: Permission
): void {
  if (!hasPermission(session, permission)) {
    throw new Error('Insufficient permissions')
  }
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.ADMIN
}

export function isDispatcher(session: Session | null): boolean {
  return session?.user?.role === UserRole.DISPATCHER
}

export function isCleaner(session: Session | null): boolean {
  return session?.user?.role === UserRole.CLEANER
}

export function isCustomer(session: Session | null): boolean {
  return session?.user?.role === UserRole.CUSTOMER
}

export function canManageBookings(session: Session | null): boolean {
  return hasPermission(session, 'manage_bookings')
}

export function canManageCustomers(session: Session | null): boolean {
  return hasPermission(session, 'manage_customers')
}

export function canViewReports(session: Session | null): boolean {
  return hasPermission(session, 'view_reports')
}
