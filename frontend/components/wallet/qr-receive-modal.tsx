"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Copy, Download, Share2, QrCode } from "lucide-react"
import Image from "next/image"
import { getCoinLogo, getNetworkName } from "@/lib/utils/networks"

interface QRReceiveModalProps {
  isOpen: boolean
  onClose: () => void
  wallet: {
    address: string
    balance: string
    chainId: number
    coin: string
  }
}

export function QRReceiveModal({ isOpen, onClose, wallet }: QRReceiveModalProps) {
  const [amount, setAmount] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const { toast } = useToast()

  // Generate QR code URL using a QR code service
  useEffect(() => {
    if (wallet?.address) {
      const qrData = amount ? `${wallet.coin}:${wallet.address}?amount=${amount}` : wallet.address

      // Using QR Server API for generating QR codes
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&bgcolor=1a1a1a&color=ffffff`
      setQrCodeUrl(qrUrl)
    }
  }, [wallet?.address, wallet?.coin, amount])

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const downloadQR = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `${wallet.coin}-wallet-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code downloaded",
      description: "QR code saved to your downloads",
    })
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${wallet.coin.toUpperCase()} Wallet Address`,
          text: `Send ${wallet.coin.toUpperCase()} to this address:`,
          url: wallet.address,
        })
      } catch (error) {
        copyAddress()
      }
    } else {
      copyAddress()
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2 text-lg">
            <QrCode className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Receive {wallet?.coin?.toUpperCase()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Wallet Info */}
          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={getCoinLogo(wallet?.coin) || "/placeholder.svg"}
                alt={wallet?.coin}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white uppercase text-sm sm:text-base truncate">{wallet?.coin}</h3>
              <p className="text-xs sm:text-sm text-gray-400 truncate">{getNetworkName(wallet?.chainId)}</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-xs flex-shrink-0">
              {wallet?.balance} {wallet?.coin?.toUpperCase()}
            </Badge>
          </div>

          {/* Amount Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">
              Amount (Optional)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="bg-white/5 border-white/10 text-sm"
            />
            <p className="text-xs text-gray-400">Specify an amount to include it in the QR code</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 bg-white rounded-lg">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              )}
            </div>
          </div>

          {/* Address Display */}
          <div className="space-y-2">
            <Label className="text-sm">Wallet Address</Label>
            <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg min-w-0">
              <span className="text-white font-mono text-xs sm:text-sm flex-1 truncate">
                {formatAddress(wallet?.address)}
              </span>
              <Button variant="ghost" size="icon" onClick={copyAddress} className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 break-all">Full address: {wallet?.address}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={copyAddress} variant="outline" className="text-xs sm:text-sm">
              <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Copy</span>
            </Button>
            <Button onClick={downloadQR} variant="outline" className="text-xs sm:text-sm">
              <Download className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Download</span>
            </Button>
            <Button onClick={shareQR} variant="outline" className="text-xs sm:text-sm">
              <Share2 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Share</span>
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2 text-sm">How to receive:</h4>
            <ul className="text-xs sm:text-sm text-blue-200 space-y-1">
              <li>• Share this QR code or address with the sender</li>
              <li>
                • Make sure they send {wallet?.coin?.toUpperCase()} on {getNetworkName(wallet?.chainId)}
              </li>
              <li>• Transactions may take a few minutes to confirm</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
