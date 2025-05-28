import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Verificar si existe el token de autenticación
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
  }

  // En producción, verificarías el token y obtendrías los datos del usuario de una base de datos
  // Aquí simulamos un usuario autenticado
  return NextResponse.json({
    success: true,
    data: {
      id: "123",
      email: "demo@example.com",
      name: "Demo User",
      isEmailVerified: true,
      has2FA: true,
    },
  })
}
