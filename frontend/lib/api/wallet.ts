import { apiClient } from "./config"

// Mock data for development/fallback
const mockWallets = [
  {
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590c4C87",
    balance: "2.5",
    chainId: 97,
    coin: "bnb",
  },
  {
    address: "0x8ba1f109551bD432803012645Hac136c22C85B",
    balance: "0.75",
    chainId: 17000,
    coin: "eth",
  },
  {
    address: "0x9ca2f208552cD523803013756Iac247d33D96C",
    balance: "150.25",
    chainId: 80002,
    coin: "matic",
  },
  {
    address: "0x1ab3f309661eE543904024856Jac358e44E07D",
    balance: "45.8",
    chainId: 43113,
    coin: "avax",
  },
]

export const walletApi = {
  // ✅ walletInfoApi
  getWalletInfo: async (chainId?: number) => {
    try {
      return await apiClient.get("/wallet/info", { params: { chainId } })
    } catch (error) {
      console.warn("Using mock wallet info due to API error")
      return { data: mockWallets.find((w) => w.chainId === chainId) || mockWallets[0] }
    }
  },

  // ✅ allWalletInfoApi
  getAllWallets: async () => {
    try {
      return await apiClient.get("/wallet/all")
    } catch (error) {
      console.warn("Using mock wallets due to API error")
      return { data: mockWallets }
    }
  },

  // ✅ walletCreateApi
  createWallet: async (walletData: { chainId: number }) => {
    try {
      return await apiClient.post("/wallet/create", walletData)
    } catch (error) {
      console.error("Failed to create wallet:", error)
      throw error
    }
  },

  // ✅ withdrawApi
  withdraw: async (withdrawData: {
    chainId: number
    to: string
    amount: string
  }) => {
    try {
      return await apiClient.post("/wallet/withdraw", withdrawData)
    } catch (error) {
      console.error("Failed to withdraw:", error)
      throw error
    }
  },
}
