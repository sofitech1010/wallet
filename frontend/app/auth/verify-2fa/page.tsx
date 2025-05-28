"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Shield, ArrowLeft, Loader2, Smartphone } from "lucide-react"

export default function Verify2FAPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const { verify2FA, pendingVerification, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Si no hay verificación pendiente, redirigir al login
    if (!pendingVerification) {
      router.push("/auth/login")
    }
  }, [pendingVerification, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (token.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await verify2FA(token)
      toast({
        title: "Verification successful",
        description: "Welcome back to BlockVault!",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
      setToken("")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = async () => {
    await logout()
    router.push("/auth/login")
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setToken(value)
  }

  if (!pendingVerification) {
    return null // Evitar flash mientras redirige
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Shield className="h-12 w-12 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-400 mt-2">Enter the 6-digit code from your authenticator app</p>
        </div>

        <GradientCard className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Smartphone className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-300">
              Signed in as: <span className="text-white font-medium">{pendingVerification.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-center block">
                Verification Code
              </Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={handleTokenChange}
                placeholder="000000"
                className="bg-white/5 border-white/10 text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-gray-400 text-center">
                Enter the 6-digit code from Google Authenticator, Authy, or similar app
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              disabled={loading || token.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify & Continue
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Button variant="ghost" onClick={handleBackToLogin} className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Having trouble? Contact support or use a backup code</p>
            </div>
          </div>
        </GradientCard>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            {"Don't have access to your authenticator? "}
            <Link href="/auth/recovery" className="text-blue-400 hover:text-blue-300 font-medium">
              Use backup code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
