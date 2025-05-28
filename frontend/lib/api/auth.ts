// Asumiendo que este archivo ya existe, lo actualizamos para manejar tokens

interface LoginResponse {
  success: boolean
  data?: {
    user: any
    token?: string
    requires2FA?: boolean
    tempToken?: string
  }
  message?: string
}

interface RegisterResponse {
  success: boolean
  data?: {
    user: any
    token: string
  }
  message?: string
}

interface Verify2FAResponse {
  success: boolean
  data?: {
    user: any
    token: string
  }
  message?: string
}

export const authApi = {
  login: async ({ email, password }: { email: string; password: string }): Promise<LoginResponse> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Si hay un token, guardarlo en cookies
      if (data.data?.token) {
        document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Strict`
      }

      return data
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  },

  register: async ({
    email,
    password,
    name,
  }: { email: string; password: string; name: string }): Promise<RegisterResponse> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Guardar token en cookies
      if (data.data?.token) {
        document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Strict`
      }

      return data
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    }
  },

  verify2FALogin: async ({ tempToken, token }: { tempToken: string; token: string }): Promise<Verify2FAResponse> => {
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken, token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "2FA verification failed")
      }

      // Guardar token en cookies
      if (data.data?.token) {
        document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Strict`
      }

      return data
    } catch (error: any) {
      console.error("2FA verification error:", error)
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Eliminar token de cookies
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"

      // Opcional: notificar al servidor sobre el logout
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  },

  getUserInfo: async () => {
    try {
      const response = await fetch("/api/auth/user")

      if (!response.ok) {
        throw new Error("Failed to fetch user info")
      }

      return await response.json()
    } catch (error) {
      console.error("Get user info error:", error)
      throw error
    }
  },
}
