"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: any
  isAdmin: boolean
  loading: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check local storage for auth state to persist login
    const isAuth = localStorage.getItem("adminAuth") === "true"
    setIsAdmin(isAuth)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading && !isAdmin && pathname.startsWith("/admin")) {
      router.push("/login")
    }
    
    if (!loading && isAdmin && pathname === "/login") {
      router.push("/admin")
    }
  }, [isAdmin, loading, pathname, router])

  const login = (email: string) => {
    localStorage.setItem("adminAuth", "true")
    setIsAdmin(true)
    router.push("/admin")
  }

  const logout = () => {
    localStorage.removeItem("adminAuth")
    setIsAdmin(false)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user: isAdmin ? { email: "admin@gmail.com" } : null, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
