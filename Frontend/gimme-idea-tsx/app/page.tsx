import Link from "next/link"
import MatrixBackground from "@/components/matrix-background"
import WalletButton from "@/components/wallet-button"

export default function HomePage() {
  return (
    <>
      <MatrixBackground />

      {/* Main Logo */}
      <div className="absolute z-[1000] text-center top-[32%]">
        <h1 className="font-logo text-[8em] text-white uppercase-none shadow-glow tracking-[0.1em] mb-[60px] transition-transform duration-300 hover:animate-bounce">
          Gimme Idea !
        </h1>
      </div>

      {/* Login & Register Buttons */}
      <div className="absolute z-[1000] flex gap-5 top-[55%]">
        <Link
          href="/login"
          className="w-[200px] h-[50px] bg-primary text-black border-none rounded font-bold text-[1.2em] cursor-pointer transition-all duration-300 no-underline flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.4)] hover:translate-y-[-3px] hover:shadow-[0_8px_20px_rgb(255,255,255)] active:translate-y-0 active:opacity-80"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="w-[200px] h-[50px] bg-primary text-black border-none rounded font-bold text-[1.2em] cursor-pointer transition-all duration-300 no-underline flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.4)] hover:translate-y-[-3px] hover:shadow-[0_8px_20px_rgb(255,255,255)] active:translate-y-0 active:opacity-80"
        >
          Register
        </Link>
      </div>

      {/* Connect Wallet Button */}
      <WalletButton />
    </>
  )
}
