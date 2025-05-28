"use client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuth } from "@/hooks/use-auth"
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, Key, Mail } from "lucide-react"

export function AccountSecurity() {
  const { user } = useAuth()

  const securityChecks = [
    {
      id: "email_verified",
      title: "Email Verification",
      description: "Your email address is verified",
      status: user?.isEmailVerified ? "passed" : "failed",
      icon: Mail,
    },
    {
      id: "strong_password",
      title: "Strong Password",
      description: "Password meets security requirements",
      status: "passed", // Mock - would check password strength
      icon: Key,
    },
    {
      id: "recent_login",
      title: "Recent Activity",
      description: "No suspicious login activity detected",
      status: "passed", // Mock - would check login history
      icon: Shield,
    },
    {
      id: "account_age",
      title: "Account Age",
      description: "Account created recently",
      status: "warning", // Mock - new accounts might have warnings
      icon: Clock,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500/20 text-green-400">Secure</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400">Needs Attention</Badge>
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Warning</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>
    }
  }

  const securityScore = Math.round(
    (securityChecks.filter((check) => check.status === "passed").length / securityChecks.length) * 100,
  )

  return (
    <GradientCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-full">
          <Shield className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Account Security</h2>
      </div>

      {/* Security Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Security Score</span>
          <span className="text-2xl font-bold text-white">{securityScore}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              securityScore >= 80 ? "bg-green-500" : securityScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
      </div>

      {/* Security Checks */}
      <div className="space-y-4">
        {securityChecks.map((check) => (
          <div key={check.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <check.icon className="h-5 w-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-white">{check.title}</h4>
                <p className="text-sm text-gray-400">{check.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(check.status)}
              {getStatusBadge(check.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Security Recommendations */}
      {securityScore < 100 && (
        <Alert className="mt-6 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-200">
            <strong>Security Recommendations:</strong>
            <ul className="mt-2 space-y-1">
              {!user?.isEmailVerified && <li>• Verify your email address</li>}
              {securityScore < 80 && <li>• Enable two-factor authentication</li>}
              {securityScore < 60 && <li>• Update your password to a stronger one</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </GradientCard>
  )
}
