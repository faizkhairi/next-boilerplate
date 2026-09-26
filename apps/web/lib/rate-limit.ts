import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from './logger'

/**
 * In-memory rate limiter
 *
 * Tracks request counts per IP address in a sliding window.
 * For production with multiple servers, use Redis-based rate limiting (e.g., Upstash).
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      const entry = store[key]
      if (entry && entry.resetTime < now) {
        delete store[key]
      }
    })
  }, 5 * 60 * 1000)
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  message?: string // Custom error message
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if request should be rate limited
 *
 * @param request - Next.js request
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  // Get client IP from request
  const ip = getRequestIP(request) || 'unknown'

  const now = Date.now()
  const key = `ratelimit:${ip}`

  // Initialize or get existing rate limit data
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: store[key].resetTime,
    }
  }

  // Increment request count
  store[key].count += 1

  const remaining = Math.max(0, config.maxRequests - store[key].count)

  // Check if limit exceeded
  if (store[key].count > config.maxRequests) {
    logAudit('RATE_LIMIT_EXCEEDED', {
      ip,
      count: store[key].count,
      limit: config.maxRequests,
    })

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: store[key].resetTime,
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset: store[key].resetTime,
  }
}

/**
 * Build a 429 response for a rate-limited request.
 *
 * Always includes `Retry-After` (seconds, per RFC 9110) alongside the
 * `X-RateLimit-*` headers so well-behaved clients back off correctly.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message = 'Too many requests. Please try again later.'
): NextResponse {
  const retryAfterSeconds = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      },
    }
  )
}

/**
 * Number of reverse proxies in front of the app that append to
 * X-Forwarded-For (for example 1 for Vercel or a single nginx, 2 for a CDN
 * in front of nginx). Read on every call so tests and deploys can change it.
 */
function trustedProxyCount(): number {
  const parsed = Number.parseInt(process.env.TRUSTED_PROXY_COUNT ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

/**
 * Get the client IP address the rate limiter keys on.
 *
 * Each proxy appends the address it received the request from to the RIGHT
 * of X-Forwarded-For, and everything to the left of that is whatever the
 * client sent. Reading the leftmost entry would let a client pick a fresh
 * rate limit bucket per request, so this reads the entry written by the
 * outermost trusted proxy: `TRUSTED_PROXY_COUNT` places from the right.
 * A header with fewer entries than that bypassed a trusted proxy and is
 * ignored. Behind no proxy at all, every header is client-controlled; run the
 * app behind one in production.
 */
export function getRequestIP(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const hops = forwardedFor
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    const trusted = trustedProxyCount()
    // Fewer entries than trusted proxies means the request skipped at least
    // one of them, so every entry is client-chosen. Return null so these
    // requests share the 'unknown' bucket instead of picking their own.
    if (hops.length < trusted) return null
    return hops[hops.length - trusted] ?? null
  }

  // Set by nginx (`proxy_set_header X-Real-IP $remote_addr`) and Vercel,
  // both of which overwrite any client-sent value.
  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || null
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Strict limit for auth endpoints (5 requests per minute)
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many authentication attempts. Please try again in a minute.',
  },

  // Moderate limit for API endpoints (30 requests per minute)
  api: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.',
  },

  // Lenient limit for general routes (100 requests per minute)
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please try again later.',
  },
}
