import nacl from 'tweetnacl'
import bs58 from 'bs58'

export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    console.log('[Crypto] Verifying signature for:', walletAddress)
    console.log('[Crypto] Message:', message)
    console.log('[Crypto] Signature:', signature)

    // Decode the signature and public key
    const signatureBytes = bs58.decode(signature)
    const publicKeyBytes = bs58.decode(walletAddress)

    // Encode message
    const messageBytes = new TextEncoder().encode(message)

    console.log('[Crypto] Signature bytes length:', signatureBytes.length)
    console.log('[Crypto] Public key bytes length:', publicKeyBytes.length)
    console.log('[Crypto] Message bytes length:', messageBytes.length)

    // Verify signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    )

    console.log('[Crypto] Signature valid:', isValid)
    return isValid
  } catch (error) {
    console.error('[Crypto] Signature verification error:', error)
    return false
  }
}
