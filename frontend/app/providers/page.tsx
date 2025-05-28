"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { providerApi } from "@/lib/api/providers"
import { walletApi } from "@/lib/api/wallet"
import { getCoinList, getCoinLogo } from "@/lib/utils/networks"
import {
  Star,
  RefreshCw,
  AlertCircle,
  Send,
  Shield,
  CheckCircle,
  DollarSign,
  Users,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  Copy,
  MessageCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const paymentMethods = [
  { id: "lafise", name: "Banco Lafise", icon: "🏦" },
  { id: "bac", name: "Banco BAC", icon: "🏦" },
  { id: "payoneer", name: "Payoneer", icon: "💳" },
  { id: "wise", name: "Wise", icon: "💳" },
  { id: "zelle", name: "Zelle", icon: "💰" },
  { id: "other", name: "Other", icon: "📱" },
]

const escrowSteps = [
  { id: 1, title: "Trade Created", description: "Funds locked in escrow", completed: true },
  { id: 2, title: "Payment Pending", description: "Waiting for buyer payment", completed: false },
  { id: 3, title: "Payment Received", description: "Confirm payment received", completed: false },
  { id: 4, title: "Funds Released", description: "Transaction completed", completed: false },
]

export default function ProvidersPage() {
  const [providers, setProviders] = useState([])
  const [wallets, setWallets] = useState([])
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [escrowDialogOpen, setEscrowDialogOpen] = useState(false)
  const [currentTrade, setCurrentTrade] = useState<any>(null)
  const [escrowStatus, setEscrowStatus] = useState("locked")
  const [tradeStep, setTradeStep] = useState(1)
  const { toast } = useToast()

  const [sellOrder, setSellOrder] = useState({
    coin: "",
    amount: "",
    paymentMethod: "",
    paymentDetails: "",
    notes: "",
  })

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderType: "system",
      message: "Trade created successfully. Funds are now in escrow.",
      timestamp: new Date().toISOString(),
      type: "info",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [messageLoading, setMessageLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [providersResponse, walletsResponse] = await Promise.all([
        providerApi.getAllProviders(),
        walletApi.getAllWallets(),
      ])

      setProviders(providersResponse.data)
      setWallets(walletsResponse.data)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError("Failed to load providers. Using demo data for preview.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider)
    setSellDialogOpen(true)
  }

  const handleCreateSellOrder = async () => {
    if (!sellOrder.coin || !sellOrder.amount || !sellOrder.paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    const selectedWallet = wallets.find((w: any) => w.coin === sellOrder.coin)
    if (!selectedWallet || Number.parseFloat(selectedWallet.balance) < Number.parseFloat(sellOrder.amount)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this trade",
        variant: "destructive",
      })
      return
    }

    try {
      // Create trade order
      const tradeData = {
        id: `trade_${Date.now()}`,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        type: "sell",
        coin: sellOrder.coin,
        amount: sellOrder.amount,
        paymentMethod: sellOrder.paymentMethod,
        paymentDetails: sellOrder.paymentDetails,
        notes: sellOrder.notes,
        status: "pending",
        escrowStatus: "locked",
        createdAt: new Date().toISOString(),
      }

      setCurrentTrade(tradeData)
      setEscrowStatus("locked")
      setTradeStep(1)
      setSellDialogOpen(false)
      setChatDialogOpen(true)

      // Add initial system message
      const initialMessage = {
        id: Date.now(),
        senderType: "system",
        message: `Trade created: Selling ${sellOrder.amount} ${sellOrder.coin.toUpperCase()} via ${
          paymentMethods.find((p) => p.id === sellOrder.paymentMethod)?.name
        }. Funds are now secured in escrow.`,
        timestamp: new Date().toISOString(),
        type: "success",
      }

      // Add user's initial message
      const userMessage = {
        id: Date.now() + 1,
        senderType: "user",
        message: `Hi ${selectedProvider.name}! I want to sell ${sellOrder.amount} ${sellOrder.coin.toUpperCase()} via ${
          paymentMethods.find((p) => p.id === sellOrder.paymentMethod)?.name
        }. ${sellOrder.paymentDetails ? `Payment details: ${sellOrder.paymentDetails}` : ""} ${sellOrder.notes ? `Notes: ${sellOrder.notes}` : ""}`,
        timestamp: new Date().toISOString(),
      }

      setMessages([initialMessage, userMessage])

      // Simulate provider response
      setTimeout(() => {
        const providerResponse = {
          id: Date.now() + 2,
          senderType: "provider",
          message: `Hello! I received your sell order for ${sellOrder.amount} ${sellOrder.coin.toUpperCase()}. I'll send the payment to your ${
            paymentMethods.find((p) => p.id === sellOrder.paymentMethod)?.name
          } account. Please confirm once you receive the payment.`,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, providerResponse])
        setTradeStep(2)
      }, 2000)

      toast({
        title: "Trade Created",
        description: "Your sell order has been created and funds are in escrow",
      })

      // Reset form
      setSellOrder({
        coin: "",
        amount: "",
        paymentMethod: "",
        paymentDetails: "",
        notes: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trade order",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setMessageLoading(true)

    try {
      const message = {
        id: Date.now(),
        senderType: "user",
        message: newMessage,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Simulate provider response for certain keywords
      setTimeout(() => {
        let providerResponse = null

        if (newMessage.toLowerCase().includes("payment") && newMessage.toLowerCase().includes("received")) {
          providerResponse = {
            id: Date.now() + 1,
            senderType: "provider",
            message:
              "Great! I can see the payment has been processed. Please release the funds from escrow to complete the trade.",
            timestamp: new Date().toISOString(),
          }
          setTradeStep(3)
        } else if (newMessage.toLowerCase().includes("problem") || newMessage.toLowerCase().includes("issue")) {
          providerResponse = {
            id: Date.now() + 1,
            senderType: "provider",
            message:
              "I understand there's an issue. Let's resolve this. Can you provide more details about the problem?",
            timestamp: new Date().toISOString(),
          }
        } else {
          providerResponse = {
            id: Date.now() + 1,
            senderType: "provider",
            message: "Thanks for your message. I'm processing your request and will update you shortly.",
            timestamp: new Date().toISOString(),
          }
        }

        if (providerResponse) {
          setMessages((prev) => [...prev, providerResponse])
        }
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setMessageLoading(false)
    }
  }

  const handleConfirmPayment = () => {
    const confirmMessage = {
      id: Date.now(),
      senderType: "system",
      message: "Payment confirmed by seller. You can now release the funds from escrow.",
      timestamp: new Date().toISOString(),
      type: "success",
    }
    setMessages((prev) => [...prev, confirmMessage])
    setTradeStep(3)

    toast({
      title: "Payment Confirmed",
      description: "You can now release the funds from escrow",
    })
  }

  const handleReleaseEscrow = async () => {
    try {
      setEscrowStatus("releasing")

      // Add system message
      const releaseMessage = {
        id: Date.now(),
        senderType: "system",
        message: "Funds are being released from escrow...",
        timestamp: new Date().toISOString(),
        type: "info",
      }
      setMessages((prev) => [...prev, releaseMessage])

      // Simulate release process
      setTimeout(() => {
        setEscrowStatus("released")
        setTradeStep(4)

        const completedMessage = {
          id: Date.now() + 1,
          senderType: "system",
          message: "✅ Trade completed successfully! Funds have been released to the buyer.",
          timestamp: new Date().toISOString(),
          type: "success",
        }
        setMessages((prev) => [...prev, completedMessage])

        toast({
          title: "Trade Completed",
          description: "Funds have been released successfully",
        })

        // Auto close dialogs after completion
        setTimeout(() => {
          setEscrowDialogOpen(false)
          setChatDialogOpen(false)
        }, 3000)
      }, 2000)
    } catch (error) {
      setEscrowStatus("locked")
      toast({
        title: "Error",
        description: "Failed to release escrow",
        variant: "destructive",
      })
    }
  }

  const copyTradeId = () => {
    if (currentTrade?.id) {
      navigator.clipboard.writeText(currentTrade.id)
      toast({
        title: "Trade ID Copied",
        description: "Trade ID has been copied to clipboard",
      })
    }
  }

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case "locked":
        return "text-yellow-400 bg-yellow-500/20"
      case "releasing":
        return "text-blue-400 bg-blue-500/20"
      case "released":
        return "text-green-400 bg-green-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const getEscrowStatusIcon = (status: string) => {
    switch (status) {
      case "locked":
        return <Lock className="h-4 w-4" />
      case "releasing":
        return <Clock className="h-4 w-4 animate-spin" />
      case "released":
        return <Unlock className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">P2P Trading</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Sell your crypto to trusted providers</p>
            </div>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} className="flex-shrink-0">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-yellow-200 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Active Providers</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{providers.length}</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Available Coins</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{getCoinList().length}</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Escrow Protected</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Providers List */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Available Providers</h2>
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 sm:h-40 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {providers.map((provider: any) => (
                  <GradientCard key={provider.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-white truncate">{provider.name}</h3>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-300">{provider.rating}</span>
                          </div>
                          {provider.isOnline && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Online</Badge>
                          )}
                        </div>
                        <p className="text-gray-400 mb-3 text-sm">{provider.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.services.slice(0, 3).map((service: string) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSelectProvider(provider)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm flex-shrink-0"
                        size="sm"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Sell Crypto
                      </Button>
                    </div>
                  </GradientCard>
                ))}
              </div>
            )}
          </div>

          {/* Sell Order Dialog */}
          <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Sell Crypto to {selectedProvider?.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Provider Info */}
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{selectedProvider?.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-300">{selectedProvider?.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{selectedProvider?.description}</p>
                </div>

                {/* Coin Selection */}
                <div className="space-y-2">
                  <Label htmlFor="coin" className="text-sm">
                    Cryptocurrency to Sell *
                  </Label>
                  <Select value={sellOrder.coin} onValueChange={(value) => setSellOrder({ ...sellOrder, coin: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {wallets.map((wallet: any) => (
                        <SelectItem key={wallet.coin} value={wallet.coin} className="text-white">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={getCoinLogo(wallet.coin) || "/placeholder.svg"}
                              alt={wallet.coin}
                              width={20}
                              height={20}
                              className="rounded-full flex-shrink-0"
                            />
                            <span className="truncate">
                              {wallet.coin.toUpperCase()} (Balance: {wallet.balance})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">
                    Amount to Sell *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    value={sellOrder.amount}
                    onChange={(e) => setSellOrder({ ...sellOrder, amount: e.target.value })}
                    placeholder="0.0"
                    className="bg-white/5 border-white/10 text-sm"
                  />
                  {sellOrder.coin && (
                    <p className="text-xs text-gray-400">
                      Available: {wallets.find((w: any) => w.coin === sellOrder.coin)?.balance || "0"}{" "}
                      {sellOrder.coin.toUpperCase()}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod" className="text-sm">
                    Payment Method *
                  </Label>
                  <Select
                    value={sellOrder.paymentMethod}
                    onValueChange={(value) => setSellOrder({ ...sellOrder, paymentMethod: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id} className="text-white">
                          <div className="flex items-center space-x-2">
                            <span>{method.icon}</span>
                            <span>{method.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Details */}
                <div className="space-y-2">
                  <Label htmlFor="paymentDetails" className="text-sm">
                    Payment Details
                  </Label>
                  <Input
                    id="paymentDetails"
                    value={sellOrder.paymentDetails}
                    onChange={(e) => setSellOrder({ ...sellOrder, paymentDetails: e.target.value })}
                    placeholder="Account number, email, etc."
                    className="bg-white/5 border-white/10 text-sm"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={sellOrder.notes}
                    onChange={(e) => setSellOrder({ ...sellOrder, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    className="bg-white/5 border-white/10 text-sm resize-none"
                    rows={3}
                  />
                </div>

                {/* Escrow Notice */}
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-blue-200 text-xs">
                    Your cryptocurrency will be held in escrow until payment is confirmed. This protects both parties in
                    the transaction.
                  </AlertDescription>
                </Alert>

                <Button onClick={handleCreateSellOrder} className="w-full">
                  Create Sell Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat Dialog */}
          <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl mx-4 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Trade Chat with {selectedProvider?.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setEscrowDialogOpen(true)}
                      size="sm"
                      className={`${getEscrowStatusColor(escrowStatus)} border`}
                      variant="outline"
                    >
                      {getEscrowStatusIcon(escrowStatus)}
                      <span className="ml-2 capitalize">{escrowStatus}</span>
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  {/* Trade Summary */}
                  {currentTrade && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">Trade Details</h4>
                        <Button onClick={copyTradeId} size="sm" variant="ghost" className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          ID: {currentTrade.id.slice(-8)}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Selling:</span>
                          <p className="text-white font-medium">
                            {currentTrade.amount} {currentTrade.coin.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Payment:</span>
                          <p className="text-white font-medium">
                            {paymentMethods.find((p) => p.id === currentTrade.paymentMethod)?.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <p className="text-white font-medium capitalize">{currentTrade.status}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Escrow:</span>
                          <p className={`font-medium capitalize ${getEscrowStatusColor(escrowStatus).split(" ")[0]}`}>
                            {escrowStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-white/5 rounded-lg">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === "user"
                            ? "justify-end"
                            : message.senderType === "system"
                              ? "justify-center"
                              : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg text-sm ${
                            message.senderType === "user"
                              ? "bg-purple-500 text-white"
                              : message.senderType === "system"
                                ? message.type === "success"
                                  ? "bg-green-500/20 text-green-200 border border-green-500/30"
                                  : message.type === "info"
                                    ? "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                                    : "bg-gray-500/20 text-gray-200 border border-gray-500/30"
                                : "bg-gray-700 text-gray-100"
                          }`}
                        >
                          {message.senderType === "system" && (
                            <div className="flex items-center space-x-1 mb-1">
                              <Shield className="h-3 w-3" />
                              <span className="text-xs font-medium">System</span>
                            </div>
                          )}
                          <p>{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-white/5 border-white/10 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && !messageLoading && sendMessage()}
                      disabled={messageLoading || escrowStatus === "released"}
                    />
                    <Button onClick={sendMessage} size="sm" disabled={messageLoading || escrowStatus === "released"}>
                      {messageLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Trade Progress & Actions */}
                <div className="space-y-4">
                  {/* Trade Progress */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3 text-sm">Trade Progress</h4>
                    <div className="space-y-3">
                      {escrowSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index < tradeStep
                                ? "bg-green-500 text-white"
                                : index === tradeStep
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-600 text-gray-300"
                            }`}
                          >
                            {index < tradeStep ? "✓" : step.id}
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                index < tradeStep
                                  ? "text-green-400"
                                  : index === tradeStep
                                    ? "text-blue-400"
                                    : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm">Quick Actions</h4>

                    {tradeStep === 2 && (
                      <Button
                        onClick={handleConfirmPayment}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Payment Received
                      </Button>
                    )}

                    {tradeStep >= 3 && escrowStatus === "locked" && (
                      <Button
                        onClick={() => setEscrowDialogOpen(true)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
                        size="sm"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Release Escrow
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Support Contacted",
                          description: "Our support team will assist you shortly",
                        })
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>

                  {/* Escrow Status */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm">Escrow Status</h4>
                    <div className={`flex items-center space-x-2 p-2 rounded ${getEscrowStatusColor(escrowStatus)}`}>
                      {getEscrowStatusIcon(escrowStatus)}
                      <span className="text-sm font-medium capitalize">{escrowStatus}</span>
                    </div>
                    {currentTrade && (
                      <p className="text-xs text-gray-400 mt-2">
                        {currentTrade.amount} {currentTrade.coin.toUpperCase()} secured
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Escrow Dialog */}
          <Dialog open={escrowDialogOpen} onOpenChange={setEscrowDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Escrow Management</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Current Status */}
                <div
                  className={`p-4 rounded-lg border ${
                    escrowStatus === "locked"
                      ? "bg-yellow-500/10 border-yellow-500/20"
                      : escrowStatus === "releasing"
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-green-500/10 border-green-500/20"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getEscrowStatusIcon(escrowStatus)}
                    <h4 className={`font-medium capitalize ${getEscrowStatusColor(escrowStatus).split(" ")[0]}`}>
                      {escrowStatus === "locked"
                        ? "Funds in Escrow"
                        : escrowStatus === "releasing"
                          ? "Releasing Funds"
                          : "Funds Released"}
                    </h4>
                  </div>
                  <p
                    className={`text-sm ${
                      escrowStatus === "locked"
                        ? "text-yellow-200"
                        : escrowStatus === "releasing"
                          ? "text-blue-200"
                          : "text-green-200"
                    }`}
                  >
                    {escrowStatus === "locked" &&
                      `${currentTrade?.amount} ${currentTrade?.coin.toUpperCase()} is safely held in escrow`}
                    {escrowStatus === "releasing" && "Funds are being processed for release..."}
                    {escrowStatus === "released" && "Transaction completed successfully!"}
                  </p>
                </div>

                {/* Trade Information */}
                {currentTrade && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm">Trade Information</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trade ID:</span>
                        <span className="text-white font-mono">{currentTrade.id.slice(-12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">
                          {currentTrade.amount} {currentTrade.coin.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span className="text-white">{currentTrade.providerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{new Date(currentTrade.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {escrowStatus === "locked" && (
                  <>
                    {/* Release Instructions */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm">Release Instructions:</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-400 font-bold">1.</span>
                          <span>Confirm payment has been received in your account</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-400 font-bold">2.</span>
                          <span>Verify payment amount and details match the agreement</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-400 font-bold">3.</span>
                          <span>Click "Release Funds" to complete the trade</span>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-200 text-xs">
                        <strong>Warning:</strong> Only release funds after confirming payment. This action cannot be
                        undone.
                      </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleReleaseEscrow}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        disabled={escrowStatus !== "locked"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Release Funds
                      </Button>
                      <Button variant="outline" onClick={() => setEscrowDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </>
                )}

                {escrowStatus === "releasing" && (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-200 text-sm">Processing release...</p>
                  </div>
                )}

                {escrowStatus === "released" && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-200 text-sm">Trade completed successfully!</p>
                    <Button
                      onClick={() => {
                        setEscrowDialogOpen(false)
                        setChatDialogOpen(false)
                      }}
                      className="mt-3"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
