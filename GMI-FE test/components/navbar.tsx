"use client"

import type React from "react"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/stores/app-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { LayoutDashboard, Plus, MessageCircle, User, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { wallet, disconnectWallet } = useAppStore()

  const handleChatAI = () => {
    alert("Chat AI feature coming soon!")
  }

  const handleLogout = () => {
    disconnectWallet()
    router.push("/")
    setIsMenuOpen(false)
  }

  if (!wallet.connected) return null

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-projects", label: "My Projects", icon: Plus },
  ]

  const NavLinkButton = ({
    href,
    label,
    icon: Icon,
  }: { href: string; label: string; icon: React.ComponentType<{ className: string }> }) => (
    <Link href={href}>
      <Button variant={pathname === href ? "default" : "ghost"} size="sm" className="gap-2">
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </Link>
  )

  const MobileMenuContent = () => (
    <div className="space-y-4">
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="block">
          <Button variant={pathname === link.href ? "default" : "ghost"} className="w-full justify-start gap-2">
            <link.icon className="w-4 h-4" />
            {link.label}
          </Button>
        </Link>
      ))}

      <div className="border-t pt-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleChatAI}>
          <MessageCircle className="w-4 h-4" />
          Chat AI
        </Button>
      </div>

      <div className="border-t pt-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            router.push("/profile")
            setIsMenuOpen(false)
          }}
        >
          <User className="w-4 h-4" />
          Edit Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <NavLinkButton key={link.href} href={link.href} label={link.label} icon={link.icon} />
            ))}

            <Button variant="ghost" size="sm" onClick={handleChatAI} className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat AI
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <WalletButton />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <WalletButton />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-6">
                  <MobileMenuContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </nav>
  )
}
