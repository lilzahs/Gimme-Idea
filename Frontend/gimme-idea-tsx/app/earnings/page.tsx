"use client"

import type React from "react"

import { useEffect, useState } from "react"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2, DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { Payment } from "@/lib/types"

export default function EarningsPage() {
  const [balance, setBalance] = useState(0)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    loadEarningsData()
  }, [])

  const loadEarningsData = async () => {
    setIsLoading(true)
    try {
      const [balanceData, paymentsData] = await Promise.all([
        apiClient.getBalance(),
        apiClient.getPaymentHistory({ limit: 50 }),
      ])

      setBalance(balanceData.balance)
      setPayments(paymentsData.data || [])
    } catch (error) {
      console.error("[v0] Failed to load earnings:", error)
      toast.error("Failed to load earnings data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (amount > balance) {
      toast.error("Insufficient balance")
      return
    }

    setIsWithdrawing(true)
    try {
      await apiClient.withdraw(amount, "bank_transfer", {})
      toast.success("Withdrawal request submitted!")
      setWithdrawAmount("")
      loadEarningsData()
    } catch (error: any) {
      toast.error(error.message || "Failed to process withdrawal")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="text-green-500" size={20} />
      case "withdraw":
        return <ArrowUpRight className="text-red-500" size={20} />
      case "reward":
        return <TrendingUp className="text-primary" size={20} />
      default:
        return <DollarSign className="text-gray" size={20} />
    }
  }

  return (
    <ProtectedRoute>
      <MatrixBackground />
      <Header />

      <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Earnings & Withdrawals</h1>
            <p className="text-gray text-lg">Manage your rewards and payments</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Balance & Withdraw */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 border-2 border-primary/20 mb-6">
                  <h2 className="text-xl font-bold text-white mb-4">Current Balance</h2>
                  <div className="text-4xl font-bold text-primary mb-6">${balance.toFixed(2)}</div>

                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Withdraw Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={balance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isWithdrawing || !withdrawAmount}
                      className="w-full px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWithdrawing ? "Processing..." : "Request Withdrawal"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Payment History */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg p-6 border-2 border-primary/20">
                  <h2 className="text-xl font-bold text-white mb-6">Payment History</h2>

                  {payments.length === 0 ? (
                    <p className="text-gray text-center py-8">No payment history yet</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 bg-input rounded hover:bg-input/80 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            {getPaymentIcon(payment.type)}
                            <div>
                              <p className="text-white font-semibold capitalize">{payment.type}</p>
                              <p className="text-gray text-sm flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${payment.type === "withdraw" ? "text-red-500" : "text-green-500"}`}
                            >
                              {payment.type === "withdraw" ? "-" : "+"}${payment.amount.toFixed(2)}
                            </p>
                            <p className="text-gray text-sm capitalize">{payment.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
