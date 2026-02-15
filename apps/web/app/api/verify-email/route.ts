import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

/**
 * POST /api/verify-email
 *
 * Verify user email address using the token sent during registration.
 * Once verified, the user can sign in to their account.
 *
 * @param request - Next.js request object with JSON body
 *
 * Request Body:
 * @param {string} email - User email address (required)
 * @param {string} token - Email verification token (required)
 *
 * @returns {200} Email verified successfully
 * @returns {400} Validation failed or invalid/expired token
 * @returns {500} Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    await verifyEmail(email, token);

    return NextResponse.json(
      {
        message:
          "Email verified successfully! You can now sign in to your account.",
      },
      { status: 200 }
    );
  } catch (error) {
    logError(error as Error, { endpoint: "/api/verify-email" });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
