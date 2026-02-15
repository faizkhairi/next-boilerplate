import Stripe from "stripe";

// =============================================================================
// Stripe Client (Opt-In)
// =============================================================================
// Only loads if STRIPE_SECRET_KEY is set in environment variables.
// This ensures zero external dependencies by default.

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY environment variable to enable payments."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }

  return stripeClient;
}

// =============================================================================
// Subscription Management
// =============================================================================

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.userEmail,
    client_reference_id: params.userId,
    metadata: {
      userId: params.userId,
    },
  });

  return session;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return subscription;
}

export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
}

// =============================================================================
// Webhook Helpers
// =============================================================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Required for webhook verification."
    );
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
