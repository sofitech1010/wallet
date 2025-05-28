"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { providerApi } from "@/lib/api/providers"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Shield, Star, DollarSign, Clock, CheckCircle, Building, Mail, CreditCard } from "lucide-react"

const serviceOptions = [
  { id: "exchange", name: "Cryptocurrency Exchange", icon: "🔄" },
  { id: "trading", name: "P2P Trading", icon: "📈" },
  { id: "staking", name: "Staking Services", icon: "💰" },
  { id: "defi", name: "DeFi Solutions", icon: "🏦" },
  { id: "consulting", name: "Crypto Consulting", icon: "💡" },
  { id: "development", name: "Blockchain Development", icon: "⚙️" },
  { id: "analytics", name: "Market Analytics", icon: "📊" },
  { id: "custody", name: "Custody Services", icon: "🔒" },
]

const paymentMethods = [
  { id: "bank_transfer", name: "Bank Transfer", icon: "🏦" },
  { id: "paypal", name: "PayPal", icon: "💳" },
  { id: "wise", name: "Wise", icon: "💳" },
  { id: "payoneer", name: "Payoneer", icon: "💳" },
  { id: "zelle", name: "Zelle", icon: "💰" },
  { id: "cash", name: "Cash", icon: "💵" },
  { id: "other", name: "Other", icon: "📱" },
]

export default function ProviderRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [providerData, setProviderData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    website: "",
    description: "",

    // Business Information
    businessType: "",
    businessRegistration: "",
    taxId: "",
    address: "",
    country: "",

    // Services & Capabilities
    services: [] as string[],
    paymentMethods: [] as string[],
    supportedCoins: [] as string[],
    minimumTrade: "",
    maximumTrade: "",

    // Verification Documents
    businessLicense: "",
    identityDocument: "",
    proofOfAddress: "",

    // Terms & Conditions
    termsAccepted: false,
    kycCompleted: false,
    amlCompliant: false,
  })

  const handleServiceToggle = (serviceId: string) => {
    setProviderData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }))
  }

  const handlePaymentMethodToggle = (methodId: string) => {
    setProviderData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(methodId)
        ? prev.paymentMethods.filter((m) => m !== methodId)
        : [...prev.paymentMethods, methodId],
    }))
  }

  const handleCoinToggle = (coin: string) => {
    setProviderData((prev) => ({
      ...prev,
      supportedCoins: prev.supportedCoins.includes(coin)
        ? prev.supportedCoins.filter((c) => c !== coin)
        : [...prev.supportedCoins, coin],
    }))
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return providerData.name && providerData.email && providerData.description
      case 2:
        return providerData.businessType && providerData.country
      case 3:
        return providerData.services.length > 0 && providerData.paymentMethods.length > 0
      case 4:
        return providerData.termsAccepted && providerData.kycCompleted && providerData.amlCompliant
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields before proceeding",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Registration Incomplete",
        description: "Please complete all required fields and accept terms",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await providerApi.createProvider(providerData)

      toast({
        title: "Registration Successful!",
        description: "Your provider application has been submitted for review",
      })

      // Redirect to provider dashboard
      router.push("/providers/dashboard")
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Basic Information</h2>
        <p className="text-gray-400 text-sm sm:text-base">Tell us about yourself and your business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">
            Business/Provider Name *
          </Label>
          <Input
            id="name"
            value={providerData.name}
            onChange={(e) => setProviderData({ ...providerData, name: e.target.value })}
            placeholder="Your business name"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={providerData.email}
            onChange={(e) => setProviderData({ ...providerData, email: e.target.value })}
            placeholder="contact@yourbusiness.com"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm">
            Phone Number
          </Label>
          <Input
            id="phone"
            value={providerData.phone}
            onChange={(e) => setProviderData({ ...providerData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm">
            Website
          </Label>
          <Input
            id="website"
            value={providerData.website}
            onChange={(e) => setProviderData({ ...providerData, website: e.target.value })}
            placeholder="https://yourbusiness.com"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm">
          Business Description *
        </Label>
        <Textarea
          id="description"
          value={providerData.description}
          onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
          placeholder="Describe your business, services, and what makes you unique..."
          className="bg-white/5 border-white/10 resize-none text-sm"
          rows={4}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <Building className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Business Details</h2>
        <p className="text-gray-400 text-sm sm:text-base">Provide your business registration information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm">
            Business Type *
          </Label>
          <Select
            value={providerData.businessType}
            onValueChange={(value) => setProviderData({ ...providerData, businessType: value })}
          >
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="individual" className="text-white">
                Individual
              </SelectItem>
              <SelectItem value="llc" className="text-white">
                LLC
              </SelectItem>
              <SelectItem value="corporation" className="text-white">
                Corporation
              </SelectItem>
              <SelectItem value="partnership" className="text-white">
                Partnership
              </SelectItem>
              <SelectItem value="other" className="text-white">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm">
            Country *
          </Label>
          <Select
            value={providerData.country}
            onValueChange={(value) => setProviderData({ ...providerData, country: value })}
          >
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="us" className="text-white">
                United States
              </SelectItem>
              <SelectItem value="ca" className="text-white">
                Canada
              </SelectItem>
              <SelectItem value="uk" className="text-white">
                United Kingdom
              </SelectItem>
              <SelectItem value="de" className="text-white">
                Germany
              </SelectItem>
              <SelectItem value="ni" className="text-white">
                Nicaragua
              </SelectItem>
              <SelectItem value="other" className="text-white">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessRegistration" className="text-sm">
            Business Registration Number
          </Label>
          <Input
            id="businessRegistration"
            value={providerData.businessRegistration}
            onChange={(e) => setProviderData({ ...providerData, businessRegistration: e.target.value })}
            placeholder="123456789"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId" className="text-sm">
            Tax ID
          </Label>
          <Input
            id="taxId"
            value={providerData.taxId}
            onChange={(e) => setProviderData({ ...providerData, taxId: e.target.value })}
            placeholder="XX-XXXXXXX"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm">
          Business Address
        </Label>
        <Textarea
          id="address"
          value={providerData.address}
          onChange={(e) => setProviderData({ ...providerData, address: e.target.value })}
          placeholder="Street address, city, state, postal code"
          className="bg-white/5 border-white/10 resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-green-400 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Services & Capabilities</h2>
        <p className="text-gray-400 text-sm sm:text-base">Define what services you offer and your trading limits</p>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <Label className="text-sm">Services Offered *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {serviceOptions.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                providerData.services.includes(service.id)
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              onClick={() => handleServiceToggle(service.id)}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl flex-shrink-0">{service.icon}</span>
                <span className="text-white text-xs sm:text-sm truncate">{service.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <Label className="text-sm">Accepted Payment Methods *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                providerData.paymentMethods.includes(method.id)
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              onClick={() => handlePaymentMethodToggle(method.id)}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl flex-shrink-0">{method.icon}</span>
                <span className="text-white text-xs sm:text-sm truncate">{method.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Cryptocurrencies */}
      <div className="space-y-3">
        <Label className="text-sm">Supported Cryptocurrencies</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {["BTC", "ETH", "BNB", "USDT", "USDC", "MATIC", "AVAX", "FTM", "OP"].map((coin) => (
            <div
              key={coin}
              className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all text-center ${
                providerData.supportedCoins.includes(coin)
                  ? "border-green-500 bg-green-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
              onClick={() => handleCoinToggle(coin)}
            >
              <span className="text-white font-medium text-xs sm:text-sm">{coin}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimumTrade" className="text-sm">
            Minimum Trade Amount (USD)
          </Label>
          <Input
            id="minimumTrade"
            type="number"
            value={providerData.minimumTrade}
            onChange={(e) => setProviderData({ ...providerData, minimumTrade: e.target.value })}
            placeholder="100"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximumTrade" className="text-sm">
            Maximum Trade Amount (USD)
          </Label>
          <Input
            id="maximumTrade"
            type="number"
            value={providerData.maximumTrade}
            onChange={(e) => setProviderData({ ...providerData, maximumTrade: e.target.value })}
            placeholder="10000"
            className="bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Verification & Compliance</h2>
        <p className="text-gray-400 text-sm sm:text-base">Complete verification to start providing services</p>
      </div>

      {/* Compliance Checkboxes */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start space-x-3 p-3 sm:p-4 bg-white/5 rounded-lg">
          <Checkbox
            id="termsAccepted"
            checked={providerData.termsAccepted}
            onCheckedChange={(checked) => setProviderData({ ...providerData, termsAccepted: checked as boolean })}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Label htmlFor="termsAccepted" className="text-white cursor-pointer text-sm sm:text-base">
              I accept the Terms of Service and Provider Agreement *
            </Label>
            <p className="text-xs text-gray-400 mt-1">
              By checking this box, you agree to our terms and conditions for service providers
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 sm:p-4 bg-white/5 rounded-lg">
          <Checkbox
            id="kycCompleted"
            checked={providerData.kycCompleted}
            onCheckedChange={(checked) => setProviderData({ ...providerData, kycCompleted: checked as boolean })}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Label htmlFor="kycCompleted" className="text-white cursor-pointer text-sm sm:text-base">
              I have completed KYC (Know Your Customer) verification *
            </Label>
            <p className="text-xs text-gray-400 mt-1">Identity verification is required for all service providers</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 sm:p-4 bg-white/5 rounded-lg">
          <Checkbox
            id="amlCompliant"
            checked={providerData.amlCompliant}
            onCheckedChange={(checked) => setProviderData({ ...providerData, amlCompliant: checked as boolean })}
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Label htmlFor="amlCompliant" className="text-white cursor-pointer text-sm sm:text-base">
              I comply with AML (Anti-Money Laundering) regulations *
            </Label>
            <p className="text-xs text-gray-400 mt-1">Compliance with financial regulations is mandatory</p>
          </div>
        </div>
      </div>

      {/* Document Upload Placeholders */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">Required Documents</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
            <div className="text-center">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-white mb-1">Business License</p>
              <p className="text-xs text-gray-400 mb-2">Upload your business registration</p>
              <Button size="sm" variant="outline" className="text-xs">
                Upload
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
            <div className="text-center">
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-white mb-1">Identity Document</p>
              <p className="text-xs text-gray-400 mb-2">Government-issued ID</p>
              <Button size="sm" variant="outline" className="text-xs">
                Upload
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 rounded-lg border border-dashed border-white/20 sm:col-span-2 lg:col-span-1">
            <div className="text-center">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-white mb-1">Proof of Address</p>
              <p className="text-xs text-gray-400 mb-2">Utility bill or bank statement</p>
              <Button size="sm" variant="outline" className="text-xs">
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2 text-sm sm:text-base">Application Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <span className="text-gray-400">Business Name:</span>
            <p className="text-white truncate">{providerData.name || "Not provided"}</p>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <p className="text-white truncate">{providerData.email || "Not provided"}</p>
          </div>
          <div>
            <span className="text-gray-400">Services:</span>
            <p className="text-white">{providerData.services.length} selected</p>
          </div>
          <div>
            <span className="text-gray-400">Payment Methods:</span>
            <p className="text-white">{providerData.paymentMethods.length} selected</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center pt-12 md:pt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Become a Provider</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Join our network of trusted cryptocurrency service providers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center px-4">
            <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center flex-shrink-0">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      step >= stepNumber ? "bg-purple-500 text-white" : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-8 sm:w-12 h-0.5 ${step > stepNumber ? "bg-purple-500" : "bg-gray-600"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center text-xs text-gray-400 px-4">
            <div className="truncate">Basic Info</div>
            <div className="truncate">Business</div>
            <div className="truncate">Services</div>
            <div className="truncate">Verification</div>
          </div>

          {/* Form Content */}
          <GradientCard className="p-4 sm:p-6 lg:p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="order-2 sm:order-1"
              >
                Previous
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 order-1 sm:order-2"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(4)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Submitting...</span>
                      <span className="sm:hidden">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Submit Application</span>
                      <span className="sm:hidden">Submit</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </GradientCard>

          {/* Benefits Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <GradientCard className="p-4 sm:p-6 text-center">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Earn Revenue</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Generate income from trading fees and service commissions
              </p>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6 text-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Secure Platform</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Built-in escrow system protects all transactions</p>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Build Reputation</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Rating system helps you build trust with clients</p>
            </GradientCard>
          </div>
        </div>
      </main>
    </div>
  )
}
