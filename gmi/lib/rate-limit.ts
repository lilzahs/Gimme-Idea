/**
 * Rate Limiting System for GMI
 * Supports in-memory and Redis-based rate limiting
 */

import { headers } from "next/headers"

// In-memory store for rate limiting (development)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  max: number
  /**
   * Time window in seconds
   */
  windowSeconds: number
  /**
   * Custom identifier (e.g., wallet address)
   * If not provided, uses IP address
   */
  identifier?: string
  /**
   * Skip rate limiting check (useful for testing)
   */
  skip?: boolean
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Get client identifier (IP address or custom)
 */
async function getClientIdentifier(customId?: string): Promise<string> {
  if (customId) return customId

  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"

  return ip
}

/**
 * Check rate limit using in-memory store
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  if (config.skip) {
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      reset: Date.now() + config.windowSeconds * 1000,
    }
  }

  const identifier = await getClientIdentifier(config.identifier)
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, config.max - entry.count)
  const success = entry.count <= config.max

  const result: RateLimitResult = {
    success,
    limit: config.max,
    remaining,
    reset: entry.resetAt,
  }

  if (!success) {
    result.retryAfter = Math.ceil((entry.resetAt - now) / 1000)
  }

  return result
}

/**
 * Redis-based rate limiter (for production with Upstash/Vercel KV)
 * Requires: npm install @upstash/redis
 */
export async function checkRateLimitRedis(
  redis: any, // Type: Redis from @upstash/redis
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  if (config.skip) {
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      reset: Date.now() + config.windowSeconds * 1000,
    }
  }

  const identifier = await getClientIdentifier(config.identifier)
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const resetAt = now + windowMs

  // Use Redis pipeline for atomic operations
  const pipeline = redis.pipeline()
  pipeline.incr(key)
  pipeline.pexpire(key, windowMs)

  const [count] = (await pipeline.exec()) as [number, string]

  const remaining = Math.max(0, config.max - count)
  const success = count <= config.max

  const result: RateLimitResult = {
    success,
    limit: config.max,
    remaining,
    reset: resetAt,
  }

  if (!success) {
    result.retryAfter = Math.ceil(windowMs / 1000)
  }

  return result
}

/**
 * Common rate limit presets
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  STRICT: { max: 10, windowSeconds: 60 },
  // Normal: 30 requests per minute
  NORMAL: { max: 30, windowSeconds: 60 },
  // Relaxed: 100 requests per minute
  RELAXED: { max: 100, windowSeconds: 60 },
  // Per hour: 500 requests
  HOURLY: { max: 500, windowSeconds: 3600 },
  // Authentication: 5 attempts per 15 minutes
  AUTH: { max: 5, windowSeconds: 900 },
  // Create post: 5 per hour
  CREATE_POST: { max: 5, windowSeconds: 3600 },
  // Comment: 20 per minute
  COMMENT: { max: 20, windowSeconds: 60 },
  // View tracking: 1000 per hour (liberal)
  VIEW_TRACKING: { max: 1000, windowSeconds: 3600 },
}

/**
 * Rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": (result.retryAfter || 0).toString(),
      },
    },
  )
}

/**
 * Helper function to apply rate limiting in Server Actions
 */
export async function withRateLimit<T>(
  config: RateLimitConfig,
  handler: () => Promise<T>,
): Promise<T> {
  const result = await checkRateLimit(config)

  if (!result.success) {
    throw new Error(
      `Rate limit exceeded. Try again in ${result.retryAfter} seconds. (${result.remaining}/${result.limit} remaining)`,
    )
  }

  return handler()
}
