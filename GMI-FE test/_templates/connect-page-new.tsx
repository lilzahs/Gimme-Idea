/**
 * TEMPLATE: New Connect Wallet Page
 * Copy this to: app/connect/page.tsx
 *
 * Changes:
 * - Removed getOrCreateProfile Server Action
 * - Added signAuthMessage + API.Wallet.connectWallet
 * - Added signature caching
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAppStore } from "@/lib/stores/app-store"
import { signAuthMessage, storeSignature } from "@/lib/auth/sign-message"
import { API } from "@/lib/api"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function ConnectWallet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const wallet = useWallet()
  const setWallet = useAppStore((state) => state.setWallet)
  const setUserProfile = useAppStore((state) => state.setUserProfile)

  const handleConnectComplete = async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      setError("Wallet not connected properly")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const walletAddress = wallet.publicKey.toString()

      // 1. Sign authentication message
      const { signature, message, address } = await signAuthMessage(wallet)

      // 2. Call GMI-BE API to connect wallet
      const response = await API.Wallet.connectWallet({
        address,
        type: wallet.wallet?.adapter.name || 'phantom',
        signature,
        message
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to connect wallet')
      }

      // 3. Store signature for future API calls
      storeSignature(address, signature, message)

      // 4. Update app state
      setUserProfile(response.data.wallet)
      setWallet({
        address: walletAddress,
        type: wallet.wallet?.adapter.name.toLowerCase() as any,
        connected: true,
      })

      console.log('[Wallet] Connected:', walletAddress)
      router.push("/dashboard")
    } catch (err) {
      let errorMessage = "Failed to connect wallet"

      if (err instanceof Error) {
        const errorStr = err.message.toLowerCase()

        if (errorStr.includes("rejected") || errorStr.includes("user denied")) {
          errorMessage = "Signature was cancelled. Please try again."
        } else if (errorStr.includes("not found")) {
          errorMessage = "Wallet not found. Install Phantom or Solflare."
        } else {
          errorMessage = err.message
        }
      }

      console.error('[Wallet] Connection error:', err)
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">All your data will be linked to this wallet</p>
          <p className="text-xs text-muted-foreground">Using Solana Devnet for testing</p>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {wallet.connected && (
          <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">Wallet connected! Click continue to sign in.</p>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-3">
          <WalletMultiButton className="h-12" />
          <Button
            onClick={handleConnectComplete}
            disabled={!wallet.connected || loading}
            className="w-full max-w-xs"
          >
            {loading ? "Authenticating..." : wallet.connected ? "Continue & Sign" : "Connect Wallet Above"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Don't have a Solana wallet? Download Phantom or Solflare from their official websites.
          Make sure to switch to Devnet for testing.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-purple-900">Devnet Setup Required:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>
              • Fund your wallet:{" "}
              <a href="https://solfaucet.com" target="_blank" rel="noopener noreferrer" className="underline">
                solfaucet.com
              </a>
            </li>
            <li>• Switch to Devnet in your wallet settings</li>
            <li>• All transactions are testnet only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
