import { apiClient } from "./config"

// Mock providers for development
const mockProviders = [
  {
    id: "1",
    name: "CryptoExchange Pro",
    email: "support@cryptoexchange.com",
    description: "Professional cryptocurrency exchange services",
    rating: 4.8,
    services: ["Exchange", "Trading", "Staking"],
    isOnline: true,
  },
  {
    id: "2",
    name: "DeFi Solutions",
    email: "contact@defisolutions.com",
    description: "Decentralized finance solutions and consulting",
    rating: 4.6,
    services: ["DeFi", "Consulting", "Development"],
    isOnline: false,
  },
  {
    id: "3",
    name: "Blockchain Analytics",
    email: "info@blockchainanalytics.com",
    description: "Advanced blockchain analytics and reporting",
    rating: 4.9,
    services: ["Analytics", "Reporting", "Compliance"],
    isOnline: true,
  },
]

const mockChats = [
  {
    id: "chat1",
    providerId: "1",
    providerName: "CryptoExchange Pro",
    lastMessage: "How can I help you today?",
    timestamp: "2024-01-15T10:30:00Z",
    unreadCount: 2,
  },
  {
    id: "chat2",
    providerId: "3",
    providerName: "Blockchain Analytics",
    lastMessage: "Your report is ready for download",
    timestamp: "2024-01-14T15:45:00Z",
    unreadCount: 0,
  },
]

const mockMessages = [
  {
    id: "1",
    chatId: "chat1",
    senderId: "user",
    senderType: "user",
    message: "Hello, I need help with my transaction",
    timestamp: "2024-01-15T10:25:00Z",
  },
  {
    id: "2",
    chatId: "chat1",
    senderId: "1",
    senderType: "provider",
    message: "Hello! I'd be happy to help. Can you provide the transaction hash?",
    timestamp: "2024-01-15T10:26:00Z",
  },
]

export const providerApi = {
  // ✅ createProvider
  createProvider: async (providerData: any) => {
    try {
      return await apiClient.post("/providers/create", providerData)
    } catch (error) {
      console.warn("Mock provider creation")
      return { data: { id: Date.now().toString(), ...providerData } }
    }
  },

  // ✅ findByEMail
  findByEmail: async (email: string) => {
    try {
      return await apiClient.get(`/providers/findByEMail/${email}`)
    } catch (error) {
      console.warn("Using mock provider search")
      const provider = mockProviders.find((p) => p.email === email)
      return { data: provider }
    }
  },

  // ✅ getAllProviders
  getAllProviders: async () => {
    try {
      return await apiClient.get("/providers/allProviders")
    } catch (error) {
      console.warn("Using mock providers due to API error")
      return { data: mockProviders }
    }
  },

  // ✅ createChatApi
  createChat: async (chatData: any) => {
    try {
      return await apiClient.post("/providers/createChat", chatData)
    } catch (error) {
      console.warn("Mock chat creation")
      return { data: { id: Date.now().toString(), ...chatData } }
    }
  },

  // ✅ sendMessageAsUserApi
  sendMessageAsUser: async (messageData: any) => {
    try {
      return await apiClient.post("/providers/sendMessageAsUser", messageData)
    } catch (error) {
      console.warn("Mock message sent")
      return { data: { id: Date.now().toString(), ...messageData, senderType: "user" } }
    }
  },

  // ✅ sendMessageAsProviderApi
  sendMessageAsProvider: async (messageData: any) => {
    try {
      return await apiClient.post("/providers/sendMessageAsProvider", messageData)
    } catch (error) {
      console.warn("Mock provider message sent")
      return { data: { id: Date.now().toString(), ...messageData, senderType: "provider" } }
    }
  },

  // ✅ getMessagesApi
  getMessages: async (chatId: string) => {
    try {
      return await apiClient.get(`/providers/getMessages/${chatId}`)
    } catch (error) {
      console.warn("Using mock messages due to API error")
      const chatMessages = mockMessages.filter((msg) => msg.chatId === chatId)
      return { data: chatMessages }
    }
  },

  getAllChats: async () => {
    try {
      return await apiClient.get("/providers/chats")
    } catch (error) {
      console.warn("Using mock chats due to API error")
      return { data: mockChats }
    }
  },
}
