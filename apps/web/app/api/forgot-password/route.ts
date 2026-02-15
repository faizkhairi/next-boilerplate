import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth-utils";
import { forgotPasswordSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

/**
 * POST /api/forgot-password
 *
 * Request a password reset email.
 * Returns success regardless of whether the email exists to prevent email enumeration.
 *
 * @param request - Next.js request object with JSON body
 *
 * Request Body:
 * @param {string} email - User email address (required)
 *
 * @returns {200} Success - password reset email sent (or email doesn't exist)
 * @returns {400} Validation failed
 * @returns {500} Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await requestPasswordReset(email);

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent password reset instructions.",
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error as Error, { endpoint: "/api/forgot-password" });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
