import Link from "next/link"

export default function SmallLogo() {
  return (
    <Link href="/" className="fixed top-5 left-5 z-[1001] cursor-pointer transition-all duration-300 hover:scale-105">
      <h2 className="font-logo text-[1.5em] text-white shadow-[0_0_10px_#00d9ff] hover:shadow-[0_0_20px_#00d9ff]">
        Gimme Idea!
      </h2>
    </Link>
  )
}
