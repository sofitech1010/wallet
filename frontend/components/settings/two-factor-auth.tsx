"use client"

import { useState, useEffect } from "react"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { Shield, Smartphone, QrCode, Copy, CheckCircle, AlertTriangle, Key, Download } from "lucide-react"

export function TwoFactorAuth() {
  const { toast } = useToast()
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupStep, setSetupStep] = useState<"qr" | "verify" | "backup">("qr")

  useEffect(() => {
    fetchTwoFactorStatus()
  }, [])

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await authApi.get2FAStatus()
      setIs2FAEnabled(response.data.enabled)
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error)
    }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    if (enabled) {
      // Enable 2FA - show setup dialog
      setShowSetupDialog(true)
      setSetupStep("qr")
      await initiate2FASetup()
    } else {
      // Disable 2FA
      await disable2FA()
    }
  }

  const initiate2FASetup = async () => {
    setSetupLoading(true)
    try {
      const response = await authApi.toggle2FA(true)
      setQrCode(response.data.qrCode)
      setBackupCodes(response.data.backupCodes || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to setup 2FA",
        variant: "destructive",
      })
    } finally {
      setSetupLoading(false)
    }
  }

  const verify2FASetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await authApi.verify2FACode(verificationCode)
      setIs2FAEnabled(true)
      setSetupStep("backup")
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      })
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: "The verification code is incorrect. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    try {
      await authApi.toggle2FA(false)
      setIs2FAEnabled(false)
      setQrCode(null)
      setBackupCodes([])
      setVerificationCode("")
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to disable 2FA",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const downloadBackupCodes = () => {
    const content = `BlockVault 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleDateString()}\n\n${backupCodes.join("\n")}\n\nKeep these codes safe and secure!`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "blockvault-backup-codes.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <GradientCard className="p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-full">
          <Shield className="h-5 w-5 text-green-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-white">Two-Factor Authentication</h2>
      </div>

      <div className="space-y-6">
        {/* Status and Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-white">Authenticator App</h4>
              <p className="text-sm text-gray-400">
                {is2FAEnabled ? "2FA is currently enabled" : "Add an extra layer of security"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {is2FAEnabled && (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            )}
            <Switch checked={is2FAEnabled} onCheckedChange={handleToggle2FA} disabled={loading} />
          </div>
        </div>

        {/* Setup Dialog */}
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogContent className="w-full max-w-md mx-4 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Setup Two-Factor Authentication</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {setupStep === "qr" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium text-white mb-2">Step 1: Scan QR Code</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>

                    {qrCode ? (
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white rounded-lg">
                          <img src={qrCode || "/placeholder.svg"} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center mb-4">
                        <div className="w-48 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={() => setSetupStep("verify")} className="w-full" disabled={setupLoading}>
                    {setupLoading ? "Loading..." : "I've Scanned the QR Code"}
                  </Button>
                </div>
              )}

              {setupStep === "verify" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium text-white mb-2">Step 2: Verify Setup</h3>
                    <p className="text-sm text-gray-400 mb-4">Enter the 6-digit code from your authenticator app</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-lg tracking-widest bg-white/5 border-white/10"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setSetupStep("qr")} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={verify2FASetup}
                      disabled={loading || verificationCode.length !== 6}
                      className="flex-1"
                    >
                      {loading ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === "backup" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-medium text-white mb-2">2FA Successfully Enabled!</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your
                      phone.
                    </p>
                  </div>

                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-200">
                      <strong>Important:</strong> Store these backup codes securely. Each code can only be used once.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Backup Codes</Label>
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes} className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/5 rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white/5 rounded text-sm font-mono"
                        >
                          <span>{code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setShowSetupDialog(false)
                      setSetupStep("qr")
                      setVerificationCode("")
                    }}
                    className="w-full"
                  >
                    Complete Setup
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-white flex items-center">
            <Key className="h-4 w-4 mr-2" />
            About Two-Factor Authentication
          </h4>
          <div className="text-sm text-gray-400 space-y-2">
            <p>• Adds an extra layer of security to your account</p>
            <p>• Requires both your password and a code from your phone</p>
            <p>• Works with Google Authenticator, Authy, and other TOTP apps</p>
            <p>• Backup codes allow access if you lose your device</p>
          </div>
        </div>

        {is2FAEnabled && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-200">
              Your account is protected with two-factor authentication. You'll need to enter a code from your
              authenticator app when signing in.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </GradientCard>
  )
}
