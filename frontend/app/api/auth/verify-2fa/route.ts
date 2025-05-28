import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { tempToken, token } = await request.json()

    // Validación básica
    if (!tempToken || !token) {
      return NextResponse.json(
        { success: false, message: "Temporary token and 2FA token are required" },
        { status: 400 },
      )
    }

    // Verificar que el token 2FA tenga 6 dígitos (simulación)
    if (token.length !== 6 || !/^\d+$/.test(token)) {
      return NextResponse.json({ success: false, message: "Invalid 2FA token" }, { status: 400 })
    }

    // Simulación de verificación exitosa
    // En producción, verificarías el token contra un servicio TOTP

    // Generar un token de autenticación
    const authToken = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Establecer cookie de autenticación
    cookies().set({
      name: "auth_token",
      value: authToken,
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
          email: "demo@example.com",
          name: "Demo User",
          isEmailVerified: true,
          has2FA: true,
        },
        token: authToken,
      },
      message: "2FA verification successful",
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
