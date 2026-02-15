import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}!</p>
        </div>
        <form
          action={async () => {
            "use server";
            const { signOut } = await import("next-auth/react");
            await signOut({ callbackUrl: "/" });
          }}
        >
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{session?.user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{session?.user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Commonly used features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/profile" className="block text-sm text-primary hover:underline">
              Edit Profile
            </Link>
            <Link href="/dashboard/settings" className="block text-sm text-primary hover:underline">
              Settings
            </Link>
            <Link href="/dashboard/subscription" className="block text-sm text-primary hover:underline">
              Subscription
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Next steps for your app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This is a production-ready Next.js 15 boilerplate with zero external dependencies.
              Customize it to build your SaaS application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
