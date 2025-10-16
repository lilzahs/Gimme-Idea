"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import SmallLogo from "@/components/small-logo"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    console.log("[v0] 📧 Đang gửi email reset password...")
    console.log("[v0] Email:", email)

    setIsLoading(true)
    try {
      await apiClient.forgotPassword(email)
      setShowSuccessPopup(true)
      toast.success("✅ Email đã được gửi!")
      console.log("[v0] ✅ Reset link sent!")
    } catch (error: any) {
      toast.error(error.message || "❌ Gửi email thất bại!")
      console.error("[v0] ❌ Forgot password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false)
    router.push("/login")
  }

  return (
    <>
      <MatrixBackground />
      <SmallLogo />

      {/* Forgot Password Form */}
      <div className="absolute w-[400px] bg-card z-[1000] flex justify-center items-center p-10 rounded shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
        <div className="relative w-full flex justify-center items-center flex-col gap-10">
          <h2 className="text-[2em] text-primary uppercase">Forgot Password?</h2>

          <form className="w-full flex flex-col gap-[25px]" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative w-full">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="relative w-full bg-input border-none outline-none p-[25px_10px_7.5px] rounded text-white font-medium text-[1em] transition-all duration-300 focus:bg-[#3a3a3a] disabled:opacity-50"
              />
              <i
                className={`absolute left-0 px-[10px] py-[15px] not-italic text-gray pointer-events-none transition-all duration-500 ${email ? "translate-y-[-7.5px] text-[0.8em] text-white" : ""}`}
              >
                Email Address
              </i>
            </div>

            {/* Links */}
            <div className="relative w-full flex justify-between">
              <Link href="/login" className="text-white no-underline transition-all duration-300 hover:text-primary">
                ← Back to Login
              </Link>
              <span></span>
            </div>

            {/* Submit Button */}
            <div className="relative w-full">
              <input
                type="submit"
                value={isLoading ? "Sending..." : "Send Reset Link"}
                disabled={isLoading}
                className="w-full p-[10px] bg-primary text-black font-semibold text-[1.35em] tracking-[0.05em] cursor-pointer transition-all duration-300 rounded hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(0,255,0,0.5)] active:opacity-80 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-[30px_40px] rounded-lg border-2 border-primary z-[3000] text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-[popIn_0.3s_ease]">
          <h3 className="text-primary text-[1.5em] mb-[15px]">✅ Email Sent!</h3>
          <p className="text-white mb-5">Vui lòng check email để reset mật khẩu.</p>
          <button
            onClick={closeSuccessPopup}
            className="bg-primary text-black border-none py-[10px] px-[30px] rounded font-semibold cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(0,255,0,0.5)]"
          >
            OK
          </button>
        </div>
      )}
    </>
  )
}
