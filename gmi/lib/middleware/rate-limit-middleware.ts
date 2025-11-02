/**
 * Rate Limit Middleware for Next.js API Routes
 * Usage in middleware.ts or API routes
 */

import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, RateLimitConfig, rateLimitResponse } from "@/lib/rate-limit"

/**
 * Create a rate-limited API handler
 *
 * @example
 * ```ts
 * export const GET = withRateLimitHandler(
 *   { max: 10, windowSeconds: 60 },
 *   async (request) => {
 *     return NextResponse.json({ data: "success" })
 *   }
 * )
 * ```
 */
export function withRateLimitHandler(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<Response> | Response,
) {
  return async (request: NextRequest) => {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(config)

    // Add rate limit headers to response
    const addRateLimitHeaders = (response: Response) => {
      response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString())
      response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
      response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString())
      return response
    }

    // If rate limit exceeded
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    // Execute handler and add headers
    const response = await handler(request)
    return addRateLimitHeaders(response)
  }
}

/**
 * Route-specific rate limit configs
 */
export const RouteRateLimits = {
  // Public endpoints
  "/api/posts": { max: 100, windowSeconds: 60 },
  "/api/posts/[id]": { max: 50, windowSeconds: 60 },
  "/api/comments": { max: 30, windowSeconds: 60 },
  "/api/view": { max: 1000, windowSeconds: 3600 },

  // Write operations
  "/api/posts/create": { max: 5, windowSeconds: 3600 },
  "/api/comments/create": { max: 20, windowSeconds: 60 },
  "/api/profile/update": { max: 10, windowSeconds: 60 },

  // Authentication
  "/api/wallet/connect": { max: 10, windowSeconds: 60 },
  "/api/wallet/disconnect": { max: 10, windowSeconds: 60 },

  // Prize operations
  "/api/prize/distribute": { max: 3, windowSeconds: 3600 },
  "/api/prize/claim": { max: 5, windowSeconds: 300 },

  // Image upload
  "/api/upload": { max: 10, windowSeconds: 300 },
}

/**
 * Global middleware rate limiter
 * Add to middleware.ts to protect all routes
 */
export async function rateLimitMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip rate limiting for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Get rate limit config for this route
  let config: RateLimitConfig | undefined

  // Exact match
  if (pathname in RouteRateLimits) {
    config = RouteRateLimits[pathname as keyof typeof RouteRateLimits]
  } else {
    // Pattern match for dynamic routes
    for (const [pattern, limit] of Object.entries(RouteRateLimits)) {
      if (matchRoute(pathname, pattern)) {
        config = limit
        break
      }
    }
  }

  // Default rate limit if no specific config
  if (!config) {
    config = { max: 100, windowSeconds: 60 }
  }

  // Check rate limit
  const result = await checkRateLimit(config)

  if (!result.success) {
    return rateLimitResponse(result)
  }

  // Continue with rate limit headers
  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())

  return response
}

/**
 * Simple route pattern matcher
 * Supports [id] style dynamic segments
 */
function matchRoute(pathname: string, pattern: string): boolean {
  const patternParts = pattern.split("/")
  const pathParts = pathname.split("/")

  if (patternParts.length !== pathParts.length) {
    return false
  }

  return patternParts.every((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return true // Dynamic segment
    }
    return part === pathParts[i]
  })
}

/**
 * Rate limit by wallet address
 * Use this for wallet-specific operations
 */
export async function checkWalletRateLimit(
  walletAddress: string,
  config: Omit<RateLimitConfig, "identifier">,
) {
  return checkRateLimit({
    ...config,
    identifier: `wallet:${walletAddress}`,
  })
}

/**
 * Rate limit by IP + wallet combination
 * More strict for sensitive operations
 */
export async function checkStrictRateLimit(walletAddress: string, config: Omit<RateLimitConfig, "identifier">) {
  // Get IP
  const identifier = await (async () => {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    return forwarded?.split(",")[0] || realIp || "unknown"
  })()

  return checkRateLimit({
    ...config,
    identifier: `strict:${identifier}:${walletAddress}`,
  })
}
