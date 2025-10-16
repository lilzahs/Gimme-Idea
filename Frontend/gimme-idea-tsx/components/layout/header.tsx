"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import WalletButton from "@/components/wallet-button"
import { Menu, X, User, LogOut, Plus, Bookmark, DollarSign } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-card/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-logo text-primary hover:opacity-80 transition-opacity">
            Gimme Idea!
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-white hover:text-primary transition-colors">
              Browse
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/project/new"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  Submit Project
                </Link>
                <Link href="/bookmarks" className="text-white hover:text-primary transition-colors">
                  <Bookmark size={20} />
                </Link>
                <Link href="/earnings" className="text-white hover:text-primary transition-colors">
                  <DollarSign size={20} />
                </Link>
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <WalletButton />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-input rounded hover:bg-primary hover:text-black transition-all"
                >
                  <User size={18} />
                  <span className="hidden md:inline">{user?.username}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border-2 border-primary/20 rounded-lg shadow-lg overflow-hidden">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-white hover:bg-primary hover:text-black transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-white hover:bg-primary hover:text-black transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-white hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white">
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-primary/20">
            <nav className="flex flex-col gap-4">
              <Link
                href="/browse"
                className="text-white hover:text-primary transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Browse
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/project/new"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Submit Project
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Bookmarks
                  </Link>
                  <Link
                    href="/earnings"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Earnings
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleLogout()
                    }}
                    className="text-left text-white hover:text-primary transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-white hover:text-primary transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
