"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (type: string, address: string) => void
}

declare global {
  interface Window {
    solana?: any
    solflare?: any
    ethereum?: any
  }
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEscape)
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const connectPhantom = async () => {
    console.log("[v0] 🔗 Connecting Phantom wallet...")

    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect()
        const publicKey = response.publicKey.toString()

        console.log("[v0] ✅ Phantom connected!")
        console.log("[v0] Public Key:", publicKey)

        localStorage.setItem("walletConnected", "phantom")
        localStorage.setItem("walletAddress", publicKey)

        onConnect("phantom", publicKey)
      } catch (error) {
        console.error("[v0] ❌ Phantom connection error:", error)
        toast.error("Failed to connect Phantom wallet")
      }
    } else {
      toast.error("Phantom wallet not installed")
      window.open("https://phantom.app", "_blank")
    }
  }

  const connectSolflare = async () => {
    console.log("[v0] 🔗 Connecting Solflare wallet...")

    if (window.solflare && window.solflare.isSolflare) {
      try {
        await window.solflare.connect()
        const publicKey = window.solflare.publicKey.toString()

        console.log("[v0] ✅ Solflare connected!")
        console.log("[v0] Public Key:", publicKey)

        localStorage.setItem("walletConnected", "solflare")
        localStorage.setItem("walletAddress", publicKey)

        onConnect("solflare", publicKey)
      } catch (error) {
        console.error("[v0] ❌ Solflare connection error:", error)
        toast.error("Failed to connect Solflare wallet")
      }
    } else {
      toast.error("Solflare wallet not installed")
      window.open("https://solflare.com", "_blank")
    }
  }

  const connectMetaMask = async () => {
    console.log("[v0] 🔗 Connecting MetaMask...")

    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const address = accounts[0]

        console.log("[v0] ✅ MetaMask connected!")
        console.log("[v0] Address:", address)

        localStorage.setItem("walletConnected", "metamask")
        localStorage.setItem("walletAddress", address)

        onConnect("metamask", address)
      } catch (error) {
        console.error("[v0] ❌ MetaMask connection error:", error)
        toast.error("Failed to connect MetaMask")
      }
    } else {
      toast.error("MetaMask not installed")
      window.open("https://metamask.io", "_blank")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/80 z-[2000] flex justify-center items-center animate-[fadeIn_0.3s_ease]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card p-10 rounded-lg w-[400px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-[slideIn_0.3s_ease] border-2 border-primary relative max-md:fixed max-md:bottom-0 max-md:w-full max-md:max-w-full max-md:rounded-t-[20px] max-md:rounded-b-none max-md:animate-[slideUp_0.3s_ease]">
        <button
          onClick={onClose}
          className="absolute top-[15px] right-[15px] bg-transparent border-none text-gray text-[1.5em] cursor-pointer transition-all duration-300 hover:text-primary hover:rotate-90"
        >
          <X size={24} />
        </button>

        <h3 className="text-primary text-[1.8em] mb-[30px] text-center">Connect Wallet</h3>

        {/* Phantom */}
        <div
          onClick={connectPhantom}
          className="flex items-center gap-[15px] p-[15px] mb-[15px] bg-input border-2 border-transparent rounded cursor-pointer transition-all duration-300 hover:border-primary hover:bg-[rgba(0,255,0,0.1)] max-md:min-h-[60px]"
        >
          <img
            src="https://cryptologos.cc/logos/solana-sol-logo.png"
            alt="Phantom"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white text-[1.1em] font-semibold">Phantom Wallet</span>
        </div>

        {/* Solflare */}
        <div
          onClick={connectSolflare}
          className="flex items-center gap-[15px] p-[15px] mb-[15px] bg-input border-2 border-transparent rounded cursor-pointer transition-all duration-300 hover:border-primary hover:bg-[rgba(0,255,0,0.1)] max-md:min-h-[60px]"
        >
          <img
            src="https://cryptologos.cc/logos/solana-sol-logo.png"
            alt="Solflare"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white text-[1.1em] font-semibold">Solflare Wallet</span>
        </div>

        {/* MetaMask */}
        <div
          onClick={connectMetaMask}
          className="flex items-center gap-[15px] p-[15px] mb-[15px] bg-input border-2 border-transparent rounded cursor-pointer transition-all duration-300 hover:border-primary hover:bg-[rgba(0,255,0,0.1)] max-md:min-h-[60px]"
        >
          <img
            src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
            alt="MetaMask"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-white text-[1.1em] font-semibold">MetaMask</span>
        </div>
      </div>
    </div>
  )
}
