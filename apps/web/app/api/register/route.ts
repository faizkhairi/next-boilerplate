import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-utils";
import { registerSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";
import { checkRateLimit, RateLimitPresets } from "@/lib/ratelimit";

/**
 * POST /api/register
 *
 * Register a new user account with email and password.
 * Sends a verification email to the provided address.
 *
 * @param request - Next.js request object with JSON body
 *
 * Request Body:
 * @param {string} email - User email address (required)
 * @param {string} password - User password (required, min 8 chars)
 * @param {string} name - User full name (optional)
 *
 * @returns {201} Registration successful
 * @returns {400} Validation failed
 * @returns {409} User already exists
 * @returns {429} Rate limit exceeded
 * @returns {500} Internal server error
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting (5 requests per minute)
  const rateLimit = checkRateLimit(request, RateLimitPresets.auth);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: RateLimitPresets.auth.message },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Register user
    const user = await registerUser({ email, password, name });

    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to verify your account.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    logError(error as Error, { endpoint: "/api/register" });

    if (error instanceof Error) {
      if (error.message === "User already exists") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
