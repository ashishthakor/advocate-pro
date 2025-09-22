'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">⚖️</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  AdvocatePro
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Services
              </Link>
              <Link href="/about" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>
              {user ? (
                <>
                  <Link href="/clients" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Clients
                  </Link>
                  <Link href="/cases" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Cases
                  </Link>
                  <Link href="/dashboard" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-3">
                    <ThemeToggle />
                    <button
                      onClick={logout}
                      className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  <Link href="/advocate/login" className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/advocate/register" className="btn-primary">
                    Join as Advocate
                  </Link>
                </div>
              )}
            </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground/80 hover:text-primary focus:outline-none focus:text-primary p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

          {isMenuOpen && (
            <div className="md:hidden border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Home
                </Link>
                <Link href="/services" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Services
                </Link>
                <Link href="/about" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Contact
                </Link>
                {user ? (
                  <>
                    <Link href="/clients" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                      Clients
                    </Link>
                    <Link href="/cases" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                      Cases
                    </Link>
                    <Link href="/dashboard" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="btn-primary block text-center">
                      Join as Advocate
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </nav>
  )
}
