import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/auth-utils";
import { resetPasswordSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

/**
 * POST /api/reset-password
 *
 * Reset user password using a valid reset token.
 * The token is sent via email after requesting a password reset.
 *
 * @param request - Next.js request object with JSON body
 *
 * Request Body:
 * @param {string} email - User email address (required)
 * @param {string} token - Password reset token from email (required)
 * @param {string} password - New password (required, min 8 chars)
 *
 * @returns {200} Password reset successful
 * @returns {400} Validation failed or invalid/expired token
 * @returns {500} Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Validate password
    const validation = resetPasswordSchema.safeParse({ password, confirmPassword: password });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    await resetPassword(email, token, password);

    return NextResponse.json(
      {
        message: "Password reset successfully! You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error as Error, { endpoint: "/api/reset-password" });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
