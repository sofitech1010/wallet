"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { providerApi } from "@/lib/api/providers"
import { getCoinLogo } from "@/lib/utils/networks"
import {
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Shield,
  RefreshCw,
  MessageCircle,
  Lock,
  Unlock,
  Copy,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Mock data for provider dashboard
const mockProviderData = {
  id: "provider_123",
  name: "CryptoExchange Pro",
  email: "support@cryptoexchange.com",
  rating: 4.8,
  totalTrades: 156,
  completedTrades: 148,
  revenue: 12450.75,
  isOnline: true,
  joinDate: "2024-01-01",
}

const mockTrades = [
  {
    id: "trade_001",
    userId: "user_456",
    userName: "John Doe",
    type: "buy",
    coin: "btc",
    amount: "0.5",
    usdValue: "22500",
    paymentMethod: "bank_transfer",
    status: "pending_payment",
    createdAt: "2024-01-15T10:30:00Z",
    escrowStatus: "locked",
    lastMessage: "I've sent the payment, please confirm",
    unreadMessages: 2,
  },
  {
    id: "trade_002",
    userId: "user_789",
    userName: "Alice Smith",
    type: "sell",
    coin: "eth",
    amount: "2.0",
    usdValue: "4680",
    paymentMethod: "paypal",
    status: "awaiting_release",
    createdAt: "2024-01-15T09:15:00Z",
    escrowStatus: "locked",
    lastMessage: "Payment confirmed, ready to release",
    unreadMessages: 0,
  },
  {
    id: "trade_003",
    userId: "user_321",
    userName: "Bob Wilson",
    type: "buy",
    coin: "bnb",
    amount: "10.0",
    usdValue: "3105",
    paymentMethod: "zelle",
    status: "completed",
    createdAt: "2024-01-14T16:45:00Z",
    escrowStatus: "released",
    lastMessage: "Trade completed successfully",
    unreadMessages: 0,
  },
]

export default function ProviderDashboardPage() {
  const [trades, setTrades] = useState(mockTrades)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTrades: 0,
    completedTrades: 0,
    pendingTrades: 0,
  })

  useEffect(() => {
    // Calculate stats from trades
    const activeTrades = trades.filter((t) => t.status !== "completed").length
    const completedTrades = trades.filter((t) => t.status === "completed").length
    const pendingTrades = trades.filter((t) => t.status === "pending_payment").length
    const totalRevenue = trades
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + Number.parseFloat(t.usdValue) * 0.01, 0) // 1% commission

    setStats({
      totalRevenue,
      activeTrades,
      completedTrades,
      pendingTrades,
    })
  }, [trades])

  const openChat = async (trade: any) => {
    setSelectedTrade(trade)
    setChatDialogOpen(true)

    // Load messages for this trade
    try {
      const response = await providerApi.getMessages(trade.id)
      setMessages(response.data)
    } catch (error) {
      // Mock messages for demo
      setMessages([
        {
          id: 1,
          senderType: "user",
          message: `Hi! I want to ${trade.type} ${trade.amount} ${trade.coin.toUpperCase()}`,
          timestamp: trade.createdAt,
        },
        {
          id: 2,
          senderType: "provider",
          message: `Hello ${trade.userName}! I can help you with that. Let me process your order.`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          senderType: "user",
          message: trade.lastMessage,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTrade) return

    setLoading(true)

    try {
      const message = {
        id: Date.now(),
        senderType: "provider",
        message: newMessage,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Update trade with new message
      setTrades((prev) =>
        prev.map((t) => (t.id === selectedTrade.id ? { ...t, lastMessage: newMessage, unreadMessages: 0 } : t)),
      )

      await providerApi.sendMessageAsProvider({
        chatId: selectedTrade.id,
        message: newMessage,
      })

      toast({
        title: "Message sent",
        description: "Your message has been sent to the trader",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTradeAction = async (tradeId: string, action: string) => {
    setLoading(true)

    try {
      let newStatus = ""
      let message = ""

      switch (action) {
        case "confirm_payment":
          newStatus = "awaiting_release"
          message = "Payment confirmed! Waiting for user to release escrow."
          break
        case "release_escrow":
          newStatus = "completed"
          message = "Escrow released. Trade completed successfully!"
          break
        case "dispute":
          newStatus = "disputed"
          message = "Trade disputed. Support team will review."
          break
      }

      // Update trade status
      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeId
            ? { ...t, status: newStatus, escrowStatus: action === "release_escrow" ? "released" : t.escrowStatus }
            : t,
        ),
      )

      // Add system message
      const systemMessage = {
        id: Date.now(),
        senderType: "system",
        message,
        timestamp: new Date().toISOString(),
        type: "info",
      }

      if (selectedTrade?.id === tradeId) {
        setMessages((prev) => [...prev, systemMessage])
      }

      toast({
        title: "Action completed",
        description: message,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-500/20 text-yellow-400"
      case "awaiting_release":
        return "bg-blue-500/20 text-blue-400"
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "disputed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment"
      case "awaiting_release":
        return "Awaiting Release"
      case "completed":
        return "Completed"
      case "disputed":
        return "Disputed"
      default:
        return status
    }
  }

  const copyTradeId = () => {
    if (selectedTrade?.id) {
      navigator.clipboard.writeText(selectedTrade.id)
      toast({
        title: "Trade ID Copied",
        description: "Trade ID copied to clipboard",
      })
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Provider Dashboard</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base truncate">Welcome back, {mockProviderData.name}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge
                className={`${mockProviderData.isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} text-xs`}
              >
                {mockProviderData.isOnline ? "Online" : "Offline"}
              </Badge>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">Total Revenue</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">Active Trades</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.activeTrades}</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.completedTrades}</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-full flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.pendingTrades}</p>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Provider Info */}
          <GradientCard className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg sm:text-xl">{mockProviderData.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white truncate">{mockProviderData.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{mockProviderData.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300">{mockProviderData.rating} rating</span>
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">
                      {mockProviderData.totalTrades} total trades
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                Edit Profile
              </Button>
            </div>
          </GradientCard>

          {/* Active Trades */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Active Trades</h2>
            <div className="space-y-3 sm:space-y-4">
              {trades.map((trade) => (
                <GradientCard key={trade.id} className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                          src={getCoinLogo(trade.coin) || "/placeholder.svg"}
                          alt={trade.coin}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                            {trade.type === "buy" ? "Selling" : "Buying"} {trade.amount} {trade.coin.toUpperCase()}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`${getStatusColor(trade.status)} text-xs`}>
                              {getStatusText(trade.status)}
                            </Badge>
                            {trade.unreadMessages > 0 && (
                              <Badge className="bg-red-500/20 text-red-400 text-xs">{trade.unreadMessages} new</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm truncate">
                          {trade.userName} • ${trade.usdValue} • {trade.paymentMethod}
                        </p>
                        <p className="text-gray-500 text-xs">{new Date(trade.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                      {trade.escrowStatus === "locked" && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Escrow
                        </Badge>
                      )}
                      {trade.escrowStatus === "released" && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <Unlock className="h-3 w-3 mr-1" />
                          Released
                        </Badge>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => openChat(trade)}
                          size="sm"
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Chat</span>
                        </Button>

                        {trade.status === "pending_payment" && (
                          <Button
                            onClick={() => handleTradeAction(trade.id, "confirm_payment")}
                            size="sm"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Confirm</span>
                          </Button>
                        )}

                        {trade.status === "awaiting_release" && (
                          <Button
                            onClick={() => handleTradeAction(trade.id, "release_escrow")}
                            size="sm"
                            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-xs"
                          >
                            <Unlock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Release</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </GradientCard>
              ))}
            </div>
          </div>

          {/* Chat Dialog */}
          <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-6xl mx-4 max-h-[90vh] w-[95vw] sm:w-auto">
              <DialogHeader>
                <DialogTitle className="text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate text-sm sm:text-base">Trade Chat - {selectedTrade?.userName}</span>
                  </div>
                  <Badge className={`${getStatusColor(selectedTrade?.status || "")} text-xs flex-shrink-0`}>
                    {getStatusText(selectedTrade?.status || "")}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[500px] sm:h-[600px]">
                {/* Chat Section */}
                <div className="xl:col-span-2 flex flex-col space-y-3 sm:space-y-4">
                  {/* Trade Info */}
                  {selectedTrade && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-400">Trade Type:</span>
                          <p className="text-white font-medium truncate">
                            {selectedTrade.type === "buy" ? "Selling to user" : "Buying from user"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Amount:</span>
                          <p className="text-white font-medium truncate">
                            {selectedTrade.amount} {selectedTrade.coin.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Value:</span>
                          <p className="text-white font-medium">${selectedTrade.usdValue}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Payment:</span>
                          <p className="text-white font-medium truncate">{selectedTrade.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white/5 rounded-lg">
                    <div className="space-y-3 sm:space-y-4">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === "provider"
                              ? "justify-end"
                              : message.senderType === "system"
                                ? "justify-center"
                                : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-sm p-3 rounded-lg text-xs sm:text-sm ${
                              message.senderType === "provider"
                                ? "bg-purple-500 text-white"
                                : message.senderType === "system"
                                  ? "bg-blue-500/20 text-blue-200 border border-blue-500/30 text-center"
                                  : "bg-gray-700 text-gray-100"
                            }`}
                          >
                            {message.senderType === "system" && (
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Shield className="h-3 w-3" />
                                <span className="text-xs font-medium">System</span>
                              </div>
                            )}
                            <p className="break-words leading-relaxed">{message.message}</p>
                            <p className="text-xs opacity-70 mt-2 text-right">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-white/5 border-white/10 text-xs sm:text-sm pr-12"
                      onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      size="sm"
                      disabled={loading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
                    >
                      {loading ? <Clock className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Trade Actions Sidebar */}
                <div className="space-y-3 sm:space-y-4 overflow-y-auto">
                  {/* Trade Actions */}
                  <div className="p-3 sm:p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-3 text-sm sm:text-base flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Trade Actions
                    </h4>
                    <div className="space-y-2">
                      {selectedTrade?.status === "pending_payment" && (
                        <Button
                          onClick={() => handleTradeAction(selectedTrade.id, "confirm_payment")}
                          className="w-full bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                          size="sm"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Confirm Payment Received
                        </Button>
                      )}

                      {selectedTrade?.status === "awaiting_release" && (
                        <Button
                          onClick={() => handleTradeAction(selectedTrade.id, "release_escrow")}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm"
                          size="sm"
                        >
                          <Unlock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Release Escrow
                        </Button>
                      )}

                      <Button
                        onClick={() => handleTradeAction(selectedTrade?.id || "", "dispute")}
                        variant="outline"
                        className="w-full text-xs sm:text-sm"
                        size="sm"
                      >
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Report Issue
                      </Button>
                    </div>
                  </div>

                  {/* Escrow Status */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Escrow Status
                    </h4>
                    <div
                      className={`flex items-center space-x-2 p-2 rounded text-xs sm:text-sm ${
                        selectedTrade?.escrowStatus === "locked"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {selectedTrade?.escrowStatus === "locked" ? (
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      ) : (
                        <Unlock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      )}
                      <span className="font-medium capitalize">{selectedTrade?.escrowStatus}</span>
                    </div>
                    {selectedTrade && (
                      <p className="text-xs text-gray-400 mt-2">
                        {selectedTrade.amount} {selectedTrade.coin.toUpperCase()} secured
                      </p>
                    )}
                  </div>

                  {/* Trade Information */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Trade Details
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Trader:</span>
                        <span className="text-white truncate ml-2">{selectedTrade?.userName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">User ID:</span>
                        <span className="text-white font-mono text-xs truncate ml-2">
                          {selectedTrade?.userId?.slice(-8)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Trade ID:</span>
                        <span className="text-white font-mono text-xs truncate ml-2">
                          {selectedTrade?.id?.slice(-8)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white text-xs truncate ml-2">
                          {selectedTrade && new Date(selectedTrade.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium mb-2 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => copyTradeId()}>
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Trade ID
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          toast({
                            title: "Support Contacted",
                            description: "Our support team will assist you shortly",
                          })
                        }}
                      >
                        <AlertTriangle className="h-3 w-3 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
