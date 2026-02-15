import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Role-Based Access Control (RBAC) utilities
 *
 * Provides role checking and permission management for Next.js API routes.
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * Check if user has required role
 *
 * @param userRole - User's current role
 * @param requiredRole - Required role for access
 * @returns true if user has required role
 */
export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: 2,
    [UserRole.USER]: 1,
  }

  const userLevel = roleHierarchy[userRole as UserRole] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  return userLevel >= requiredLevel
}

/**
 * Get current user's session with role
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
  }
}

/**
 * Require authentication for API route
 *
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * Require specific role for API route
 *
 * @param requiredRole - Minimum required role
 * @throws Error if user doesn't have required role
 */
export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()

  if (!hasRole(user.role, requiredRole)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return user
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === UserRole.ADMIN
}

/**
 * Permission definitions
 *
 * Define fine-grained permissions for different roles
 */
export const Permissions = {
  // User management
  USER_CREATE: [UserRole.ADMIN],
  USER_READ: [UserRole.USER, UserRole.ADMIN],
  USER_UPDATE_OWN: [UserRole.USER, UserRole.ADMIN],
  USER_UPDATE_ANY: [UserRole.ADMIN],
  USER_DELETE: [UserRole.ADMIN],

  // Content management (example)
  CONTENT_CREATE: [UserRole.USER, UserRole.ADMIN],
  CONTENT_READ: [UserRole.USER, UserRole.ADMIN],
  CONTENT_UPDATE_OWN: [UserRole.USER, UserRole.ADMIN],
  CONTENT_UPDATE_ANY: [UserRole.ADMIN],
  CONTENT_DELETE_OWN: [UserRole.USER, UserRole.ADMIN],
  CONTENT_DELETE_ANY: [UserRole.ADMIN],

  // Admin panel access
  ADMIN_PANEL_ACCESS: [UserRole.ADMIN],
  ANALYTICS_VIEW: [UserRole.ADMIN],
  SETTINGS_MANAGE: [UserRole.ADMIN],
} as const

/**
 * Check if user has specific permission
 *
 * @param userRole - User's current role
 * @param permission - Permission to check
 * @returns true if user has permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: keyof typeof Permissions
): boolean {
  const allowedRoles = Permissions[permission] as readonly UserRole[]
  return allowedRoles.includes(userRole)
}
