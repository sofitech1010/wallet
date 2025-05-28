import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validación básica
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, message: "Email, password, and name are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Simulación de registro exitoso
    // En producción, guardarías el usuario en una base de datos

    // Generar un token de autenticación
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
          id: `user-${Date.now()}`,
          email,
          name,
          isEmailVerified: false,
          has2FA: false,
        },
        token,
      },
      message: "Registration successful",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
