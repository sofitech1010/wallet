"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { WalletCard } from "@/components/wallet/wallet-card"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { walletApi } from "@/lib/api/wallet"
import { getMultiplePrices } from "@/lib/api/prices"
import { getCoinList } from "@/lib/utils/networks"
import { TrendingUp, Wallet, ArrowUpDown, AlertCircle, RefreshCw, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const [wallets, setWallets] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [walletsResponse, pricesData] = await Promise.all([
        walletApi.getAllWallets(),
        getMultiplePrices(getCoinList()),
      ])

      setWallets(walletsResponse.data)
      setPrices(pricesData)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Using demo data for preview.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalValue = wallets.reduce((total, wallet: any) => {
    const price = prices[wallet.coin.toLowerCase()] || 0
    return total + Number.parseFloat(wallet.balance) * price
  }, 0)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Welcome back, {user?.name}</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your multi-chain crypto portfolio</p>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-yellow-200 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Total Portfolio Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-white truncate">
                    {loading ? (
                      <div className="h-6 sm:h-8 w-20 sm:w-24 bg-white/10 rounded animate-pulse" />
                    ) : (
                      `$${totalValue.toFixed(2)}`
                    )}
                  </p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Active Wallets</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {loading ? (
                      <div className="h-6 sm:h-8 w-8 sm:w-12 bg-white/10 rounded animate-pulse" />
                    ) : (
                      wallets.length
                    )}
                  </p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full flex-shrink-0">
                  <ArrowUpDown className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Networks</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">6</p>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Wallets Grid */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Your Wallets</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 sm:h-56 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : wallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {wallets.map((wallet: any, index) => (
                  <WalletCard key={index} wallet={wallet} />
                ))}
              </div>
            ) : (
              <GradientCard className="p-6 sm:p-8 text-center">
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No wallets found</h3>
                <p className="text-gray-400 mb-4 text-sm sm:text-base">Create your first wallet to get started</p>
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Wallet
                </Button>
              </GradientCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
