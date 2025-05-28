"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TransactionItem } from "@/components/transactions/transaction-item"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { transactionApi } from "@/lib/api/transactions"
import { getCoinList } from "@/lib/utils/networks"
import { RefreshCw, AlertCircle, Filter } from "lucide-react"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: "all",
    coin: "all",
  })

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiFilters = {
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.coin !== "all" && { coin: filters.coin }),
      }
      const response = await transactionApi.getAllTransactions(apiFilters)
      setTransactions(response.data)
    } catch (error: any) {
      console.error("Error fetching transactions:", error)
      setError("Failed to load transactions. Using demo data for preview.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const getTransactionStats = () => {
    const totalTransactions = transactions.length
    const sentTransactions = transactions.filter((tx: any) => tx.type === "send").length
    const receivedTransactions = transactions.filter((tx: any) => tx.type === "receive").length
    const pendingTransactions = transactions.filter((tx: any) => tx.status === "pending").length

    return { totalTransactions, sentTransactions, receivedTransactions, pendingTransactions }
  }

  const stats = getTransactionStats()

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Transactions</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">View your transaction history</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchTransactions}
              disabled={loading}
              className="flex-shrink-0"
            >
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <GradientCard className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalTransactions}</p>
                <p className="text-gray-400 text-xs sm:text-sm">Total</p>
              </div>
            </GradientCard>
            <GradientCard className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.sentTransactions}</p>
                <p className="text-gray-400 text-xs sm:text-sm">Sent</p>
              </div>
            </GradientCard>
            <GradientCard className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.receivedTransactions}</p>
                <p className="text-gray-400 text-xs sm:text-sm">Received</p>
              </div>
            </GradientCard>
            <GradientCard className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pendingTransactions}</p>
                <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
              </div>
            </GradientCard>
          </div>

          {/* Filters */}
          <GradientCard className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Types
                    </SelectItem>
                    <SelectItem value="send" className="text-white">
                      Sent
                    </SelectItem>
                    <SelectItem value="receive" className="text-white">
                      Received
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.coin} onValueChange={(value) => setFilters({ ...filters, coin: value })}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/10">
                    <SelectValue placeholder="All Coins" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Coins
                    </SelectItem>
                    {getCoinList().map((coin) => (
                      <SelectItem key={coin} value={coin} className="text-white">
                        {coin.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GradientCard>

          {/* Transactions List */}
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-16 sm:h-20 bg-white/5 rounded-xl animate-pulse" />)
            ) : transactions.length > 0 ? (
              transactions.map((transaction: any, index) => <TransactionItem key={index} transaction={transaction} />)
            ) : (
              <GradientCard className="p-6 sm:p-8 text-center">
                <div className="text-gray-400">
                  <p className="text-base sm:text-lg font-semibold mb-2">No transactions found</p>
                  <p className="text-sm sm:text-base">No transactions match your current filters</p>
                </div>
              </GradientCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
