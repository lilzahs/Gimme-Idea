"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import SmallLogo from "@/components/small-logo"
import { Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    console.log("[v0] 🔐 Đang đăng nhập...")
    console.log("[v0] Email:", email)

    try {
      await login(email, password)
      toast.success("✅ Đăng nhập thành công!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "❌ Đăng nhập thất bại!")
    }
  }

  return (
    <>
      <MatrixBackground />
      <SmallLogo />

      {/* Login Form */}
      <div className="absolute w-[400px] bg-card z-[1000] flex justify-center items-center p-10 rounded shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
        <div className="relative w-full flex justify-center items-center flex-col gap-10">
          <h2 className="text-[2em] text-primary uppercase">Sign In</h2>

          <form className="w-full flex flex-col gap-[25px]" onSubmit={handleSubmit}>
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
                Email
              </i>
            </div>

            {/* Password */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="relative w-full bg-input border-none outline-none p-[25px_45px_7.5px_10px] rounded text-white font-medium text-[1em] transition-all duration-300 focus:bg-[#3a3a3a] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray cursor-pointer transition-all duration-300 hover:text-primary z-[100] disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <i
                className={`absolute left-0 px-[10px] py-[15px] not-italic text-gray pointer-events-none transition-all duration-500 ${password ? "translate-y-[-7.5px] text-[0.8em] text-white" : ""}`}
              >
                Password
              </i>
            </div>

            {/* Links */}
            <div className="relative w-full flex justify-between">
              <Link
                href="/forgot-password"
                className="text-white no-underline transition-all duration-300 hover:text-primary"
              >
                Forgot Password
              </Link>
              <Link
                href="/register"
                className="text-primary font-semibold no-underline transition-all duration-300 hover:text-primary"
              >
                Signup
              </Link>
            </div>

            {/* Submit Button */}
            <div className="relative w-full">
              <input
                type="submit"
                value={isLoading ? "Logging in..." : "Login"}
                disabled={isLoading}
                className="w-full p-[10px] bg-primary text-black font-semibold text-[1.35em] tracking-[0.05em] cursor-pointer transition-all duration-300 rounded hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(0,255,0,0.5)] active:opacity-80 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
