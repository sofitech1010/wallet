import { apiClient } from "./config"

// Mock transactions for development
const mockTransactions = [
  {
    hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    type: "send",
    amount: "0.5",
    coin: "eth",
    chainId: 17000,
    timestamp: "2024-01-15T10:30:00Z",
    status: "confirmed",
    to: "0x742d35Cc6634C0532925a3b8D4C9db96590c4C87",
    from: "0x8ba1f109551bD432803012645Hac136c22C85B",
    fee: "0.002",
  },
  {
    hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    type: "receive",
    amount: "2.5",
    coin: "bnb",
    chainId: 97,
    timestamp: "2024-01-14T15:45:00Z",
    status: "confirmed",
    to: "0x8ba1f109551bD432803012645Hac136c22C85B",
    from: "0x9ca2f208552cD523803013756Iac247d33D96C",
    fee: "0.005",
  },
  {
    hash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    type: "send",
    amount: "100.0",
    coin: "matic",
    chainId: 80002,
    timestamp: "2024-01-13T09:20:00Z",
    status: "pending",
    to: "0x1ab3f309661eE543904024856Jac358e44E07D",
    from: "0x8ba1f109551bD432803012645Hac136c22C85B",
    fee: "0.1",
  },
  {
    hash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    type: "receive",
    amount: "5.75",
    coin: "avax",
    chainId: 43113,
    timestamp: "2024-01-12T14:10:00Z",
    status: "confirmed",
    to: "0x8ba1f109551bD432803012645Hac136c22C85B",
    from: "0x2bc4f409772fE654915035867Kac469f55F18E",
    fee: "0.001",
  },
]

export const transactionApi = {
  getAllTransactions: async (params?: { page?: number; limit?: number; type?: string; coin?: string }) => {
    try {
      return await apiClient.get("/transaction/all", { params })
    } catch (error) {
      console.warn("Using mock transactions due to API error")
      let filteredTransactions = [...mockTransactions]

      if (params?.type && params.type !== "all") {
        filteredTransactions = filteredTransactions.filter((tx) => tx.type === params.type)
      }
      if (params?.coin && params.coin !== "all") {
        filteredTransactions = filteredTransactions.filter((tx) => tx.coin === params.coin)
      }

      return { data: filteredTransactions }
    }
  },

  getTransactionInfo: async (txHash: string) => {
    try {
      return await apiClient.get("/transaction/info", { params: { txHash } })
    } catch (error) {
      console.warn("Using mock transaction info due to API error")
      const transaction = mockTransactions.find((tx) => tx.hash === txHash) || mockTransactions[0]
      return { data: transaction }
    }
  },
}
