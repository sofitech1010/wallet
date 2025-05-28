"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

// Lista de rutas públicas
const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/verify-2fa"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  useEffect(() => {
    // Si no está cargando y no está autenticado y no es una ruta pública
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push(`/auth/login?from=${encodeURIComponent(pathname)}`)
    }

    // Si está autenticado y está en una página de autenticación, redirigir al dashboard
    if (!loading && isAuthenticated && (pathname === "/auth/login" || pathname === "/auth/register")) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, pathname, router, isPublicRoute])

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si es una ruta pública o el usuario está autenticado, mostrar el contenido
  if (isPublicRoute || isAuthenticated) {
    return <>{children}</>
  }

  // No mostrar nada mientras se redirige
  return null
}
