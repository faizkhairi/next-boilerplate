"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      // Error already logged on server-side
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start subscription process"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ Basic features</li>
              <li>✓ Up to 10 projects</li>
              <li>✓ Community support</li>
            </ul>
            <Button className="w-full mt-4" variant="outline" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>For professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ All Free features</li>
              <li>✓ Unlimited projects</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <Button
              className="w-full mt-4"
              onClick={() => handleSubscribe("price_pro")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Plan</CardTitle>
            <CardDescription>For teams and organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ All Pro features</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
              <li>✓ SLA guarantee</li>
            </ul>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => handleSubscribe("price_enterprise")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration (Optional)</CardTitle>
          <CardDescription>
            This page demonstrates opt-in Stripe payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To enable payments, set the following environment variables:
          </p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• STRIPE_SECRET_KEY</li>
            <li>• STRIPE_WEBHOOK_SECRET</li>
            <li>• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Replace <code className="bg-muted px-1 py-0.5 rounded">price_pro</code> and{" "}
            <code className="bg-muted px-1 py-0.5 rounded">price_enterprise</code> with your actual Stripe Price IDs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
