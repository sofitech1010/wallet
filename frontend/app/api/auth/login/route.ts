import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Esta es una implementación simulada para desarrollo
// En producción, deberías validar las credenciales contra una base de datos
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validación básica
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Simulación de usuario con 2FA habilitado
    if (email === "demo@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        data: {
          requires2FA: true,
          tempToken: "temp-token-for-2fa-verification",
        },
        message: "2FA verification required",
      })
    }

    // Simulación de usuario sin 2FA
    if (email.includes("@") && password.length >= 6) {
      // Generar un token simulado
      const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

      // Establecer cookie de autenticación
      cookies().set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 días
        sameSite: "strict",
      })

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: "123",
            email,
            name: email.split("@")[0],
            isEmailVerified: false,
            has2FA: false,
          },
          token,
        },
        message: "Login successful",
      })
    }

    // Credenciales inválidas
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
