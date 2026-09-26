import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers.
 * Runs a cheap query to confirm the database is reachable.
 *
 * @returns {200} { status: "ok" }
 * @returns {503} { status: "error" } - database connection failed
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
