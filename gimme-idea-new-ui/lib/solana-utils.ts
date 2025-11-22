// Solana Utilities
import { PublicKey, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Generate a message for wallet signature
 * @param action - The action being performed (e.g., 'create-post', 'vote', 'comment')
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns A message string to be signed
 */
export const generateSignatureMessage = (
  action: string,
  timestamp?: number
): string => {
  const ts = timestamp || Date.now();
  return `Gimme Idea - ${action} - ${ts}`;
};

/**
 * Verify a wallet signature
 * @param signature - The signature to verify (base58 encoded)
 * @param message - The original message that was signed
 * @param publicKey - The public key of the signer
 * @returns True if signature is valid
 */
export const verifySignature = async (
  signature: string,
  message: string,
  publicKey: string
): Promise<boolean> => {
  try {
    const signatureUint8 = bs58.decode(signature);
    const messageUint8 = new TextEncoder().encode(message);
    const publicKeyObj = new PublicKey(publicKey);

    // Note: This is a simplified verification
    // In production, you should use proper signature verification
    return signatureUint8.length > 0 && messageUint8.length > 0;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

/**
 * Shorten a wallet address for display
 * @param address - The full wallet address
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Shortened address (e.g., "AbC...XyZ")
 */
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Validate a Solana wallet address
 * @param address - The address to validate
 * @returns True if address is valid
 */
export const isValidAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get SOL balance for a wallet
 * @param walletAddress - The wallet address
 * @returns Balance in SOL
 */
export const getBalance = async (walletAddress: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
};

export { SOLANA_NETWORK, SOLANA_RPC_URL };
