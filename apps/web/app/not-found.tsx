import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-xl mt-2">Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
