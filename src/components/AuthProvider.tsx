'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null
  // The 'role' parameter is added to differentiate between advocate and user logins.
  login: (email: string, password: string, role: 'advocate' | 'user') => Promise<{ success: boolean, role?: string }>
  // Similarly, 'role' is added for registration.
  register: (name: string, email: string, password: string, role: 'advocate' | 'user') => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!token || !storedUser) {
        setLoading(false)
        return
      }

      // Determine the role from the stored user data to call the correct API endpoint
      const parsedUser: User = JSON.parse(storedUser);
      const rolePath = parsedUser.role === 'advocate' ? 'advocate' : 'user';

      const response = await fetch(`/api/${rolePath}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        logout() // Use logout to clear everything
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, role: 'advocate' | 'user'): Promise<{ success: boolean, role?: string }> => {
    try {
      // Use role to select the correct API endpoint
      const response = await fetch(`/api/${role}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user)); // Store the user object
        setUser(data.user)
        toast.success(`Welcome back, ${data.user.name}!`)
        return { success: true, role: data.user.role }; // Return the user's role
      }
      toast.error('Login failed. Please check your credentials.');
      return { success: false };
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('An error occurred during login.'); 
      return { success: false };
    }
  }

  const register = async (name: string, email: string, password: string, role: 'advocate' | 'user'): Promise<boolean> => {
    try {
      // Use role to select the correct API endpoint
      const response = await fetch(`/api/${role}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()
      console.log(data)

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user)); // Store the user object
        setUser(data.user);
        toast.success(`Account created successfully! Welcome, ${data.user.name}.`);
        return true;
      }
      toast.error(data.message || 'Registration failed. Please try again.');
      return false
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('An error occurred during registration.');
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user');
    toast('Logged out successfully!');
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}