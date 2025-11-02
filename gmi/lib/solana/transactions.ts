import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js"
import { DEVNET_RPC } from "./config"

const connection = new Connection(DEVNET_RPC, "confirmed")

export interface EscrowTransaction {
  postId: string
  totalAmount: number
  recipientAddress: string
  description: string
}

export async function lockPrizePoolInEscrow(
  escrowData: EscrowTransaction,
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
): Promise<string> {
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey("11111111111111111111111111111112"), // Placeholder escrow address
        lamports: escrowData.totalAmount * 1000000000, // Convert SOL to lamports
      }),
    )

    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const signedTransaction = await wallet.signTransaction(transaction)
    const txSignature = await connection.sendRawTransaction(signedTransaction.serialize())
    await connection.confirmTransaction(txSignature, "confirmed")

    console.log("[v0] Escrow transaction confirmed:", txSignature)
    return txSignature
  } catch (error) {
    console.error("[v0] Escrow transaction failed:", error)
    throw new Error("Failed to lock prize pool in escrow")
  }
}

export async function distributePrizes(
  postId: string,
  prizes: { rank: number; amount: number; recipient: PublicKey }[],
  wallet: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> },
): Promise<string[]> {
  try {
    const txSignatures: string[] = []

    for (const prize of prizes) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: prize.recipient,
          lamports: prize.amount * 1000000000,
        }),
      )

      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signedTransaction = await wallet.signTransaction(transaction)
      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(txSignature, "confirmed")

      txSignatures.push(txSignature)
      console.log("[v0] Prize distribution tx:", txSignature)
    }

    return txSignatures
  } catch (error) {
    console.error("[v0] Prize distribution failed:", error)
    throw new Error("Failed to distribute prizes")
  }
}

export async function verifyTransaction(txSignature: string): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(txSignature, { commitment: "confirmed" })
    return tx !== null && tx.meta?.err === null
  } catch (error) {
    console.error("[v0] Transaction verification failed:", error)
    return false
  }
}
