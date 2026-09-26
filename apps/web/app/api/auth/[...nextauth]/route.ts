import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse, RateLimitPresets } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

export { handler as GET };

/**
 * Rate limit only the credentials sign-in submission (POST
 * /api/auth/callback/credentials), not every NextAuth POST (CSRF token,
 * session refresh, OAuth callbacks, etc. all share this catch-all route).
 */
export async function POST(...args: Parameters<typeof handler>) {
  const [request] = args as [NextRequest, ...unknown[]];

  if (request.nextUrl.pathname.endsWith("/callback/credentials")) {
    const rateLimit = checkRateLimit(request, RateLimitPresets.auth);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit, RateLimitPresets.auth.message);
    }
  }

  return handler(...args);
}
