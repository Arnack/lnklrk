"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LS from '@/app/service/LS'
import { AuthService } from '@/app/service/auth'
import { toast } from 'sonner'

interface User {
  access_token?: string
  refresh_token?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { login: string; password: string }) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']

  const isAuthenticated = !!LS.getUserId()

  // Check if current route is public
  const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // User is not authenticated and trying to access protected route

        router.push('/login')
      } else if (isAuthenticated && pathname === '/login') {
        // User is authenticated but on login page, redirect to dashboard
        router.push('/mass-email')
      }
    }
  }, [isAuthenticated, isLoading, pathname, isPublicRoute, router])

  const checkAuthStatus = async () => {
    try {
      const { user: storedUser } = LS.getUserInfo()
      
      if (storedUser?.access_token) {
        // TODO: Validate token with backend if needed
        setUser(storedUser)
      } else {
        // For development, set a demo user
        setUser({
          id: "20b93366-6615-4318-8429-e180ad823eae",
          email: "test@example.com",
          name: "Test User",
          access_token: "demo-token"
        })
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // For development, set a demo user even on error
      setUser({
        id: "20b93366-6615-4318-8429-e180ad823eae",
        email: "test@example.com",
        name: "Test User",
        access_token: "demo-token"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: { login: string; password: string }) => {
    try {
      const response = await AuthService.login(credentials)
      const { user: updatedUser } = LS.getUserInfo()
      setUser(updatedUser)
      router.push('/mass-email')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    LS.removeUserInfo()
    setUser(null)
    router.push('/login')
    toast.success('Successfully logged out')
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const { refreshToken: currentRefreshToken } = LS.getTokens()
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      await AuthService.refreshToken(currentRefreshToken)
      const { user: updatedUser } = LS.getUserInfo()
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
  }

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 