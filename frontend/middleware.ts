import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define las rutas públicas que no requieren autenticación
const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/verify-2fa"]

// Define las rutas de API que no requieren autenticación
const publicApiRoutes = ["/api/auth/login", "/api/auth/register", "/api/auth/verify-2fa"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si es una ruta de API
  if (pathname.startsWith("/api/")) {
    // Si es una ruta de API pública, permitir acceso
    if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Verificar token para rutas de API protegidas
    const authToken = request.cookies.get("auth_token")?.value

    if (!authToken) {
      return new NextResponse(JSON.stringify({ success: false, message: "Authentication required" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    }

    return NextResponse.next()
  }

  // Para rutas de página (no API)
  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next()
  }

  // Verificar autenticación para rutas protegidas
  const authToken = request.cookies.get("auth_token")?.value

  // Si no hay token y es una ruta protegida, redirigir al login
  if (!authToken) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configurar el middleware para ejecutarse en todas las rutas excepto archivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
