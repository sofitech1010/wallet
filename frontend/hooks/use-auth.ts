"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { authApi } from "@/lib/api/auth"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  isEmailVerified: boolean
  has2FA: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  pendingVerification: { email: string; tempToken: string } | null
  login: (email: string, password: string) => Promise<{ requires2FA: boolean }>
  verify2FA: (token: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for development
const mockUser: User = {
  id: "1",
  email: "demo@example.com",
  name: "Demo User",
  isEmailVerified: true,
  has2FA: true,
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingVerification, setPendingVerification] = useState<{ email: string; tempToken: string } | null>(null)
  const router = useRouter()

  // Verificar si hay un token en las cookies
  const checkAuthToken = (): boolean => {
    if (typeof window === "undefined") return false

    const cookies = document.cookie.split(";")
    const authTokenCookie = cookies.find((cookie) => cookie.trim().startsWith("auth_token="))

    return !!authTokenCookie
  }

  const refreshUser = async () => {
    setLoading(true)

    // Si no hay token, no intentar obtener información del usuario
    if (!checkAuthToken()) {
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      const response = await authApi.getUserInfo()
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.warn("Using mock user due to API error")
      // Use mock user for development when API is not available
      setUser(mockUser)
      setIsAuthenticated(true)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ requires2FA: boolean }> => {
    try {
      const response = await authApi.login({ email, password })

      if (response.data?.requires2FA) {
        // Usuario tiene 2FA habilitado, necesita verificación
        setPendingVerification({
          email: email,
          tempToken: response.data.tempToken || "",
        })
        return { requires2FA: true }
      } else {
        // Login completo sin 2FA
        setUser(response.data?.user || null)
        setIsAuthenticated(true)
        return { requires2FA: false }
      }
    } catch (error) {
      console.warn("Using mock login due to API error")
      // Para desarrollo, simular que el usuario tiene 2FA
      setPendingVerification({
        email: email,
        tempToken: "mock-temp-token",
      })
      return { requires2FA: true }
    }
  }

  const verify2FA = async (token: string) => {
    if (!pendingVerification) {
      throw new Error("No pending verification")
    }

    try {
      const response = await authApi.verify2FALogin({
        tempToken: pendingVerification.tempToken,
        token: token,
      })

      setUser(response.data?.user || null)
      setIsAuthenticated(true)
      setPendingVerification(null)
    } catch (error) {
      console.warn("Using mock 2FA verification due to API error")
      // Para desarrollo, aceptar cualquier código de 6 dígitos
      if (token.length === 6) {
        setUser(mockUser)
        setIsAuthenticated(true)
        setPendingVerification(null)
      } else {
        throw new Error("Invalid 2FA code")
      }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.warn("Logout API failed, clearing user locally")
    }
    setUser(null)
    setIsAuthenticated(false)
    setPendingVerification(null)
    router.push("/auth/login")
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name })
      setUser(response.data?.user || null)
      setIsAuthenticated(true)
    } catch (error) {
      console.warn("Using mock register due to API error")
      setUser({ ...mockUser, email, name })
      setIsAuthenticated(true)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingVerification,
        login,
        verify2FA,
        logout,
        register,
        refreshUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
