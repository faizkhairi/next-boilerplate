import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getStripeClient } from "@repo/payments/stripe";
import { prisma } from "@/lib/db";
import { logError, logger } from "@/lib/logger";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handle Stripe webhook events for subscription lifecycle management.
 * Verifies webhook signature and processes events like:
 * - checkout.session.completed (new subscriptions)
 * - customer.subscription.updated (subscription changes)
 * - customer.subscription.deleted (cancellations)
 * - invoice.payment_succeeded/failed (payment status)
 *
 * @param request - Next.js request with raw body and stripe-signature header
 *
 * @returns {200} Event received and processed
 * @returns {400} Invalid signature or webhook processing error
 *
 * @see https://stripe.com/docs/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(body, signature);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const userId = session.metadata?.userId || session.client_reference_id;

          if (!userId) {
            logger.error({ sessionId: session.id }, "No userId in checkout session metadata");
            break;
          }

          // Retrieve the subscription details
          const stripe = getStripeClient();
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Stripe v22 moved current_period_start/end from the subscription
          // itself to each subscription item (a subscription can now have
          // items on different billing cycles), so read it off the first item.
          const subscriptionItem = subscription.items.data[0];

          if (!subscriptionItem) {
            logger.error(
              { subscriptionId: subscription.id },
              "Subscription has no items, cannot record billing period"
            );
            break;
          }

          // Create subscription record
          await prisma.subscription.create({
            data: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscriptionItem.price.id,
              status: subscription.status,
              currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
              currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionItem = subscription.items.data[0];

        if (!subscriptionItem) {
          logger.error(
            { subscriptionId: subscription.id },
            "Subscription has no items, cannot record billing period"
          );
          break;
        }

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
            currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.delete({
          where: { stripeSubscriptionId: subscription.id },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        // Handle successful payment
        logger.info({ invoiceId: event.data.object.id }, "Payment succeeded");
        break;
      }

      case "invoice.payment_failed": {
        // Handle failed payment
        logger.warn({ invoiceId: event.data.object.id }, "Payment failed");
        break;
      }

      default:
        logger.debug({ eventType: event.type }, "Unhandled Stripe event type");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError(error as Error, { endpoint: "/api/stripe/webhook" });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
