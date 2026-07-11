import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * AuthContext
 * Holds the authenticated user (id, name, email, role) and token.
 * Persists both to localStorage so a refresh keeps the session.
 */
const AuthContext = createContext(null)

const STORAGE_KEY_USER = 'user'
const STORAGE_KEY_TOKEN = 'token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY_USER)
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN)
      if (storedUser) setUser(JSON.parse(storedUser))
      if (storedToken) setToken(storedToken)
    } catch {
      // Corrupted storage — clear it.
      localStorage.removeItem(STORAGE_KEY_USER)
      localStorage.removeItem(STORAGE_KEY_TOKEN)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save user + token to state and localStorage.
  const login = useCallback((userData, tokenValue) => {
    setUser(userData)
    setToken(tokenValue)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData))
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenValue)
  }, [])

  // Clear state and localStorage.
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    // Convenience flags
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access the auth context. Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export default AuthContext
