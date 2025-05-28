"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GradientCard } from "@/components/ui/gradient-card"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { Key, Shield, CheckCircle, XCircle, Clock } from "lucide-react"

export function TokenManagement() {
  const { toast } = useToast()
  const [tokenData, setTokenData] = useState({
    token: "",
    status: "active",
  })
  const [verifyToken, setVerifyToken] = useState("")
  const [loading, setLoading] = useState({
    verify: false,
    update: false,
  })

  const handleVerifyToken = async () => {
    if (!verifyToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token to verify",
        variant: "destructive",
      })
      return
    }

    setLoading({ ...loading, verify: true })

    try {
      const response = await authApi.verifyToken(verifyToken)

      if (response.data.valid) {
        toast({
          title: "Token valid",
          description: "The token is valid and active",
        })
      } else {
        toast({
          title: "Token invalid",
          description: "The token is invalid or expired",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.message || "Failed to verify token",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, verify: false })
    }
  }

  const handleUpdateTokenStatus = async () => {
    if (!tokenData.token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token",
        variant: "destructive",
      })
      return
    }

    setLoading({ ...loading, update: true })

    try {
      await authApi.updateTokenStatus(tokenData)

      toast({
        title: "Token status updated",
        description: `Token status has been set to ${tokenData.status}`,
      })

      setTokenData({ token: "", status: "active" })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Failed to update token status",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, update: false })
    }
  }

  return (
    <GradientCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-full">
          <Key className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Token Management</h2>
      </div>

      <div className="space-y-6">
        {/* Token Verification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Verify Token
          </h3>
          <div className="space-y-2">
            <Label htmlFor="verifyToken">Token to Verify</Label>
            <div className="flex space-x-2">
              <Input
                id="verifyToken"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Enter token to verify"
                className="bg-white/5 border-white/10"
              />
              <Button onClick={handleVerifyToken} disabled={loading.verify}>
                {loading.verify ? "Verifying..." : "Verify"}
              </Button>
            </div>
            <p className="text-sm text-gray-400">Check if a token is valid and active in the system.</p>
          </div>
        </div>

        {/* Token Status Update */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Update Token Status
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updateToken">Token</Label>
              <Input
                id="updateToken"
                value={tokenData.token}
                onChange={(e) => setTokenData({ ...tokenData, token: e.target.value })}
                placeholder="Enter token to update"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={tokenData.status} onValueChange={(value) => setTokenData({ ...tokenData, status: value })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="active" className="text-white">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expired" className="text-white">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span>Expired</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="revoked" className="text-white">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span>Revoked</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleUpdateTokenStatus} disabled={loading.update} className="w-full">
              {loading.update ? "Updating..." : "Update Token Status"}
            </Button>
          </div>
        </div>

        {/* Information Alert */}
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            Token management allows you to verify token validity and update token statuses. Use this carefully as it
            affects authentication and verification processes.
          </AlertDescription>
        </Alert>
      </div>
    </GradientCard>
  )
}
