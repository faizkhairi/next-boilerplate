import { NextRequest } from 'next/server'
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
      if (store[key].resetTime < now) {
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
 * Get client IP address from request
 */
function getRequestIP(request: NextRequest): string | null {
  // Try various IP headers (in order of preference)
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ]

  for (const header of ipHeaders) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return null
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
