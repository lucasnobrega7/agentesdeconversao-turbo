import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  organizationId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Hook para verificar autenticação
export function useRequireAuth(redirectTo = "/auth/login") {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual auth check logic
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        })

        if (response.ok) {
          const user = await response.json()
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          // Não autenticado - redirecionar
          router.push(redirectTo)
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push(redirectTo)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkAuth()
  }, [router, redirectTo])

  return authState
}

// HOC para proteger componentes
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  options?: {
    redirectTo?: string
    roles?: string[]
    fallback?: React.ReactNode
  }
) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading, isAuthenticated } = useRequireAuth(options?.redirectTo)

    // Loading state
    if (isLoading) {
      return (
        options?.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )
      )
    }

    // Not authenticated
    if (!isAuthenticated) {
      return null // useRequireAuth já faz o redirect
    }

    // Role-based access control
    if (options?.roles && user?.role && !options.roles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      )
    }

    // Authenticated - render component
    return <Component {...props} user={user} />
  }
}

// Middleware function for API routes
export async function requireAuthAPI(
  req: Request,
  options?: {
    roles?: string[]
  }
): Promise<{ user: User } | { error: string; status: number }> {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = req.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return { error: "Token não fornecido", status: 401 }
    }

    // TODO: Validate token and get user
    // This is a placeholder - replace with actual token validation
    const response = await fetch(process.env.AUTH_SERVICE_URL + "/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      return { error: "Token inválido", status: 401 }
    }

    const user = await response.json()

    // Check roles if specified
    if (options?.roles && !options.roles.includes(user.role)) {
      return { error: "Acesso negado", status: 403 }
    }

    return { user }
  } catch (error) {
    console.error("Auth validation error:", error)
    return { error: "Erro na autenticação", status: 500 }
  }
}

// Utility to get current user without requiring auth
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include"
    })

    if (response.ok) {
      return await response.json()
    }

    return null
  } catch (error) {
    console.error("Failed to get current user:", error)
    return null
  }
}

// Logout utility
export async function logout(redirectTo = "/") {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    })
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // Always redirect after logout attempt
    window.location.href = redirectTo
  }
}
