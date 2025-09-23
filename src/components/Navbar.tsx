'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow ring-1 ring-black/5">
                  <span className="text-white font-bold text-lg">⚖️</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  AdvocatePro
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Services
              </Link>
              <Link href="/about" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </Link>
              {user ? (
                <>
                  <Link href="/clients" className="text-foreground/80 hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                    Clients
                  </Link>
                  <Link href="/cases" className="text-foreground/80 hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                    Cases
                  </Link>
                  <Link href="/dashboard" className="text-foreground/80 hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-3">
                    <ThemeToggle />
                    <button
                      onClick={logout}
                      className="text-foreground/80 hover:text-primary px-2 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <Link href="/users/register" className="inline-flex items-center rounded-md text-sm font-medium px-4 py-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-colors">
                    Join as Client
                  </Link>
                  <Link href="/advocate/register" className="inline-flex items-center rounded-md text-sm font-medium px-4 py-2 text-foreground bg-muted hover:bg-muted/80 border border-border transition-colors">
                    Join as Advocate
                  </Link>
                </div>
              )}
            </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative text-foreground/80 hover:text-foreground focus:outline-none p-2 rounded-md ring-1 ring-transparent hover:ring-border transition ${isMenuOpen ? 'bg-muted' : ''}`}
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
                    <Link href="/users/register" className="text-foreground/80 hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                      Join As Client
                    </Link>
                    <Link href="/advocate/register" className="btn-primary block text-center">
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
