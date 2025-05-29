"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { gmailService } from "@/lib/gmail"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function GmailCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setError(error)
          return
        }

        if (!code) {
          setStatus('error')
          setError('No authorization code received')
          return
        }

        // Exchange code for tokens
        await gmailService.setTokens(code)
        setStatus('success')

        // Redirect back to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        console.error('Gmail callback error:', err)
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleRetry = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Gmail Integration</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Connecting your Gmail account...'}
            {status === 'success' && 'Successfully connected!'}
            {status === 'error' && 'Connection failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we set up your Gmail integration...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Your Gmail account has been successfully connected. You'll be redirected shortly.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-muted-foreground">
                {error || 'Failed to connect Gmail account'}
              </p>
              <Button onClick={handleRetry} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 