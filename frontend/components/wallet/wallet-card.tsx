"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, EyeOff, Copy, QrCode, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/gradient-card"
import { QRReceiveModal } from "./qr-receive-modal"
import { getCoinLogo, getNetworkName } from "@/lib/utils/networks"
import { getPriceForCoin } from "@/lib/api/prices"
import { useToast } from "@/hooks/use-toast"

interface WalletCardProps {
  wallet: {
    address: string
    balance: string
    chainId: number
    coin: string
  }
  onSend?: () => void
}

export function WalletCard({ wallet, onSend }: WalletCardProps) {
  const [showAddress, setShowAddress] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [price, setPrice] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPrice = async () => {
      const coinPrice = await getPriceForCoin(wallet.coin)
      setPrice(coinPrice)
    }
    fetchPrice()
  }, [wallet.coin])

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const usdValue = (Number.parseFloat(wallet.balance) * price).toFixed(2)

  return (
    <>
      <GradientCard className="p-4 sm:p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={getCoinLogo(wallet.coin) || "/placeholder.svg"}
                  alt={wallet.coin}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white uppercase text-sm sm:text-base truncate">{wallet.coin}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{getNetworkName(wallet.chainId)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowAddress(!showAddress)} className="flex-shrink-0">
              {showAddress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Balance */}
          <div className="space-y-2 mb-4 flex-1">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white break-all">
                {Number.parseFloat(wallet.balance).toFixed(4)} {wallet.coin.toUpperCase()}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">≈ ${usdValue} USD</p>
            </div>

            {/* Address */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm min-w-0">
              <span className="text-gray-400 flex-shrink-0">Address:</span>
              <span className="text-white font-mono truncate flex-1">
                {showAddress ? wallet.address : formatAddress(wallet.address)}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={copyAddress}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={() => setShowQRModal(true)}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs sm:text-sm"
              size="sm"
            >
              <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Receive</span>
            </Button>
            {onSend && (
              <Button
                onClick={onSend}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs sm:text-sm"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Send</span>
              </Button>
            )}
          </div>
        </div>
      </GradientCard>

      <QRReceiveModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} wallet={wallet} />
    </>
  )
}
