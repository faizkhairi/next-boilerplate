import { NextResponse } from 'next/server'
import { requireRole, UserRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'
import { logError } from '@/lib/logger'

/**
 * GET /api/admin/users
 *
 * Get all users (admin only)
 *
 * @returns {200} List of users
 * @returns {401} Unauthorized
 * @returns {403} Forbidden
 * @returns {500} Internal server error
 */
export async function GET() {
  try {
    // Require admin role
    await requireRole(UserRole.ADMIN)

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    logError(error as Error, { endpoint: '/api/admin/users' })

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message.startsWith('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
