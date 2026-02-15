'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logError } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to structured logging system
    logError(error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Something Went Wrong</CardTitle>
          <CardDescription className="text-center">
            An unexpected error occurred. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
