// Solana Wallet Utilities
import { PublicKey, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Generate a message for wallet signature
export const generateSignatureMessage = (action: string, timestamp?: number): string => {
  const ts = timestamp || Date.now();
  return `Gimme Idea - ${action}\nTimestamp: ${ts}\nNetwork: ${SOLANA_NETWORK}`;
};

// Sign a message with wallet
export const signMessage = async (
  message: string,
  signMessageFn: (message: Uint8Array) => Promise<Uint8Array>
): Promise<{ signature: string; message: string }> => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await signMessageFn(encodedMessage);
    const signature = bs58.encode(signedMessage);

    return {
      signature,
      message,
    };
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

// Verify a Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Get SOL balance
export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
};

// Shorten wallet address for display
export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export default {
  connection,
  generateSignatureMessage,
  signMessage,
  isValidSolanaAddress,
  getSolBalance,
  shortenAddress,
};
