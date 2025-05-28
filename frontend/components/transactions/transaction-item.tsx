"use client"

import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/gradient-card"
import { getNetworkExplorerBase, getNetworkName } from "@/lib/utils/networks"

interface TransactionItemProps {
  transaction: {
    hash: string
    type: "send" | "receive"
    amount: string
    coin: string
    chainId: number
    timestamp: string
    status: "pending" | "confirmed" | "failed"
    to?: string
    from?: string
  }
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const openExplorer = () => {
    const explorerBase = getNetworkExplorerBase(transaction.chainId)
    window.open(`${explorerBase}${transaction.hash}`, "_blank")
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <GradientCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              transaction.type === "send" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}
          >
            {transaction.type === "send" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">{transaction.type === "send" ? "Sent" : "Received"}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {getNetworkName(transaction.chainId)} • {formatHash(transaction.hash)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`font-semibold ${transaction.type === "send" ? "text-red-400" : "text-green-400"}`}>
            {transaction.type === "send" ? "-" : "+"}
            {transaction.amount} {transaction.coin.toUpperCase()}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{new Date(transaction.timestamp).toLocaleDateString()}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={openExplorer}>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </GradientCard>
  )
}
