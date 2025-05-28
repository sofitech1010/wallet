"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { WalletCard } from "@/components/wallet/wallet-card"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { walletApi } from "@/lib/api/wallet"
import { getMultiplePrices } from "@/lib/api/prices"
import { getCoinList, getNetWorkList, getCoinLogo } from "@/lib/utils/networks"
import { Plus, Wallet, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function WalletsPage() {
  const [wallets, setWallets] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<any>(null)
  const [withdrawData, setWithdrawData] = useState({ to: "", amount: "" })
  const { toast } = useToast()

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
      setError("Failed to load wallets. Using demo data for preview.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateWallet = async () => {
    if (!selectedNetwork || selectedNetwork === "all") {
      toast({
        title: "Error",
        description: "Please select a network",
        variant: "destructive",
      })
      return
    }

    try {
      const network = getNetWorkList().find((n) => n.coin === selectedNetwork)
      await walletApi.createWallet({ chainId: network!.id })

      toast({
        title: "Success",
        description: "Wallet created successfully",
      })

      setCreateDialogOpen(false)
      setSelectedNetwork("all")
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      })
    }
  }

  const handleWithdraw = async () => {
    if (!selectedWallet || !withdrawData.to || !withdrawData.amount) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    try {
      await walletApi.withdraw({
        chainId: selectedWallet.chainId,
        to: withdrawData.to,
        amount: withdrawData.amount,
      })

      toast({
        title: "Success",
        description: "Withdrawal initiated successfully",
      })

      setWithdrawDialogOpen(false)
      setWithdrawData({ to: "", amount: "" })
      setSelectedWallet(null)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      })
    }
  }

  const filteredWallets = wallets.filter((wallet: any) =>
    selectedNetwork === "all" ? true : wallet.coin === selectedNetwork,
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-12 md:pt-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Wallets</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your multi-chain wallets</p>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-sm">
                    <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Create Wallet</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="network" className="text-sm">
                        Select Network
                      </Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Choose a blockchain network" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {getCoinList().map((coin) => {
                            const network = getNetWorkList(coin)[0]
                            return (
                              <SelectItem key={coin} value={coin} className="text-white">
                                <div className="flex items-center space-x-2">
                                  <Image
                                    src={getCoinLogo(coin) || "/placeholder.svg"}
                                    alt={coin}
                                    width={20}
                                    height={20}
                                    className="rounded-full flex-shrink-0"
                                  />
                                  <span className="truncate">
                                    {network.name} ({coin.toUpperCase()})
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateWallet} className="w-full">
                      Create Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-yellow-200 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Filter */}
          <GradientCard className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label htmlFor="filter" className="text-sm flex-shrink-0">
                Filter by Network:
              </Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10">
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">
                    All Networks
                  </SelectItem>
                  {getCoinList().map((coin) => (
                    <SelectItem key={coin} value={coin} className="text-white">
                      {coin.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </GradientCard>

          {/* Wallets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 sm:h-56 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredWallets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredWallets.map((wallet: any, index) => (
                <WalletCard
                  key={index}
                  wallet={wallet}
                  onSend={() => {
                    setSelectedWallet(wallet)
                    setWithdrawDialogOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <GradientCard className="p-6 sm:p-8 text-center">
              <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No wallets found</h3>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                {selectedNetwork !== "all"
                  ? `No wallets found for ${selectedNetwork.toUpperCase()}`
                  : "Create your first wallet to get started"}
              </p>
            </GradientCard>
          )}

          {/* Withdraw Dialog */}
          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 mx-4 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Send {selectedWallet?.coin.toUpperCase()}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to" className="text-sm">
                    Recipient Address
                  </Label>
                  <Input
                    id="to"
                    value={withdrawData.to}
                    onChange={(e) => setWithdrawData({ ...withdrawData, to: e.target.value })}
                    placeholder="0x..."
                    className="bg-white/5 border-white/10 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-sm">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    value={withdrawData.amount}
                    onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                    placeholder="0.0"
                    className="bg-white/5 border-white/10 text-sm"
                  />
                  {selectedWallet && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Available: {selectedWallet.balance} {selectedWallet.coin.toUpperCase()}
                    </p>
                  )}
                </div>
                <Button onClick={handleWithdraw} className="w-full">
                  Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
