"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GradientCard } from "@/components/ui/gradient-card"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Mail, CheckCircle, XCircle, Send, Shield, Clock } from "lucide-react"

export function EmailVerification() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [verificationToken, setVerificationToken] = useState("")
  const [loading, setLoading] = useState({
    verify: false,
    send: false,
    resend: false,
    check: false,
  })

  const handleVerifyEmail = async () => {
    if (!verificationToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification token",
        variant: "destructive",
      })
      return
    }

    setLoading({ ...loading, verify: true })

    try {
      await authApi.verifyEmail(verificationToken)
      await refreshUser()

      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified",
      })

      setVerificationToken("")
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.message || "Invalid or expired token",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, verify: false })
    }
  }

  const handleSendVerificationEmail = async () => {
    setLoading({ ...loading, send: true })

    try {
      await authApi.sendVerificationEmail()

      toast({
        title: "Verification email sent",
        description: "Please check your email for verification instructions",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send verification email",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, send: false })
    }
  }

  const handleResendToken = async () => {
    setLoading({ ...loading, resend: true })

    try {
      await authApi.resendToken()

      toast({
        title: "Token resent",
        description: "A new verification token has been sent to your email",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend token",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, resend: false })
    }
  }

  const handleCheckEmailStatus = async () => {
    setLoading({ ...loading, check: true })

    try {
      const response = await authApi.isEmailVerified()
      await refreshUser()

      if (response.data.isVerified) {
        toast({
          title: "Email verified",
          description: "Your email is already verified",
        })
      } else {
        toast({
          title: "Email not verified",
          description: "Your email still needs verification",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to check email status",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, check: false })
    }
  }

  return (
    <GradientCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-full">
          <Mail className="h-5 w-5 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Email Verification</h2>
      </div>

      {/* Email Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-gray-300">Email Status:</span>
          {user?.isEmailVerified ? (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400">
              <XCircle className="h-3 w-3 mr-1" />
              Not Verified
            </Badge>
          )}
        </div>

        <Button onClick={handleCheckEmailStatus} disabled={loading.check} variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          {loading.check ? "Checking..." : "Check Status"}
        </Button>
      </div>

      {/* Verification Alert */}
      {!user?.isEmailVerified && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            Please verify your email address to access all features and ensure account security. Check your inbox for
            the verification email.
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Actions */}
      {!user?.isEmailVerified && (
        <div className="space-y-4">
          {/* Token Input */}
          <div className="space-y-2">
            <Label htmlFor="token">Verification Token</Label>
            <div className="flex space-x-2">
              <Input
                id="token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter your verification token"
                className="bg-white/5 border-white/10"
              />
              <Button onClick={handleVerifyEmail} disabled={loading.verify}>
                {loading.verify ? "Verifying..." : "Verify"}
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Enter the verification token you received in your email to verify your account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={handleSendVerificationEmail} disabled={loading.send} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              {loading.send ? "Sending..." : "Send Verification Email"}
            </Button>

            <Button onClick={handleResendToken} disabled={loading.resend} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              {loading.resend ? "Resending..." : "Resend Token"}
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {user?.isEmailVerified && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-200">
            Your email address has been successfully verified. You now have access to all platform features.
          </AlertDescription>
        </Alert>
      )}
    </GradientCard>
  )
}
