import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers.
 * Returns service status and database connectivity.
 *
 * @returns {200} Service healthy
 * @returns {503} Service unhealthy (database connection failed)
 */
export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'next-boilerplate',
        database: 'connected',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'next-boilerplate',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
