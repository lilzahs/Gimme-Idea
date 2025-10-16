"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import WalletModal from "./wallet-modal"
import { toast } from "sonner"

export default function WalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, isAuthenticated, connectWallet: syncWalletToBackend } = useAuthStore()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletType, setWalletType] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user?.walletAddress) {
      setWalletAddress(user.walletAddress)
      setWalletType(localStorage.getItem("walletConnected") || "connected")
      console.log("[v0] ✅ Loaded wallet from user profile:", user.walletAddress)
    } else {
      // Check localStorage for non-authenticated users
      const connected = localStorage.getItem("walletConnected")
      const address = localStorage.getItem("walletAddress")

      if (connected && address) {
        setWalletType(connected)
        setWalletAddress(address)
        console.log("[v0] ✅ Loaded wallet from localStorage:", address)
      }
    }
  }, [isAuthenticated, user])

  const handleWalletConnect = async (type: string, address: string) => {
    setWalletType(type)
    setWalletAddress(address)
    setIsModalOpen(false)

    if (isAuthenticated) {
      try {
        // Determine chainId based on wallet type
        const chainId = type === "metamask" ? 1 : 101 // Ethereum mainnet or Solana mainnet
        await syncWalletToBackend(address, chainId)
        toast.success("Wallet connected and synced to your account!")
        console.log("[v0] ✅ Wallet synced to backend")
      } catch (error: any) {
        console.error("[v0] ❌ Failed to sync wallet:", error)
        toast.error("Wallet connected locally but failed to sync to account")
      }
    } else {
      toast.success("Wallet connected! Login to sync with your account.")
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem("walletConnected")
    localStorage.removeItem("walletAddress")
    setWalletType(null)
    setWalletAddress(null)
    toast.success("Wallet disconnected")
    console.log("[v0] ✅ Wallet disconnected")
  }

  const displayAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "Connect Wallet"

  return (
    <>
      <button
        onClick={() => (walletAddress ? handleDisconnect() : setIsModalOpen(true))}
        className="fixed top-5 right-5 z-[1001] bg-card text-white border-2 border-primary py-3 px-6 rounded font-semibold text-[1em] cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(2,113,182,0.6)] hover:bg-primary hover:text-black hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(2,113,182,0.6)] active:translate-y-0 max-md:fixed max-md:bottom-5 max-md:top-auto max-md:left-5 max-md:w-[calc(100%-40px)] max-md:text-center"
      >
        {displayAddress}
      </button>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleWalletConnect} />
    </>
  )
}
