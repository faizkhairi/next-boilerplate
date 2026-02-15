import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@repo/payments/stripe";
import { logError } from "@/lib/logger";

/**
 * POST /api/stripe/checkout
 *
 * Create a Stripe Checkout session for subscription payments.
 * Requires authentication and STRIPE_SECRET_KEY environment variable.
 *
 * @param request - Next.js request object with JSON body
 *
 * Request Body:
 * @param {string} priceId - Stripe Price ID for the subscription plan (required)
 *
 * @returns {200} Checkout session created - returns { url: string }
 * @returns {400} Missing required fields
 * @returns {401} Unauthorized - user not authenticated
 * @returns {500} Stripe API error or internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email,
      successUrl: `${appUrl}/dashboard/subscription?success=true`,
      cancelUrl: `${appUrl}/dashboard/subscription?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    logError(error as Error, { endpoint: "/api/stripe/checkout" });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
