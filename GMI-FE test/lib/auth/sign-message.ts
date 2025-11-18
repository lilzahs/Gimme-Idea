/**
 * Wallet Authentication Helper
 * Signs messages for API authentication
 */

import { WalletContextState } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'

/**
 * Generate authentication message
 */
export function getAuthMessage(walletAddress: string): string {
  const timestamp = Date.now()
  return `Sign this message to authenticate with Gimme Idea.\n\nWallet: ${walletAddress}\nTime: ${timestamp}`
}

/**
 * Sign message with wallet for API authentication
 */
export async function signAuthMessage(
  wallet: WalletContextState
): Promise<{ signature: string; message: string; address: string }> {
  if (!wallet.publicKey || !wallet.signMessage) {
    throw new Error('Wallet not connected or does not support message signing')
  }

  const address = wallet.publicKey.toString()
  const message = getAuthMessage(address)
  const messageBytes = new TextEncoder().encode(message)

  try {
    const signatureBytes = await wallet.signMessage(messageBytes)
    const signature = bs58.encode(signatureBytes)

    return {
      signature,
      message,
      address
    }
  } catch (error) {
    console.error('[Sign Message] Error:', error)
    throw new Error('Failed to sign message')
  }
}

/**
 * Store signature in session (optional, for caching)
 */
export function storeSignature(address: string, signature: string, message: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('wallet_auth', JSON.stringify({
      address,
      signature,
      message,
      timestamp: Date.now()
    }))
  }
}

/**
 * Get cached signature (expires after 1 hour)
 */
export function getCachedSignature(address: string): { signature: string; message: string } | null {
  if (typeof window === 'undefined') return null

  const cached = sessionStorage.getItem('wallet_auth')
  if (!cached) return null

  try {
    const data = JSON.parse(cached)
    const oneHour = 60 * 60 * 1000

    // Check if expired or address mismatch
    if (data.address !== address || Date.now() - data.timestamp > oneHour) {
      sessionStorage.removeItem('wallet_auth')
      return null
    }

    return {
      signature: data.signature,
      message: data.message
    }
  } catch {
    return null
  }
}

/**
 * Clear cached signature
 */
export function clearSignature() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('wallet_auth')
  }
}
