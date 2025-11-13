import Image from "next/image"

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-2xl">
      <Image
        src="/favicon-gimme.png"
        alt="Gimme Idea"
        width={32}
        height={32}
        className="w-8 h-8 rounded-lg"
      />
      <span>Gimme Idea</span>
    </div>
  )
}
