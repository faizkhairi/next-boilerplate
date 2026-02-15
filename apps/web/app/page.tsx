import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Next.js 15 Boilerplate</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production-ready with zero external dependencies
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
