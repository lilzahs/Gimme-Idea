import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { Wallpoet, Oxanium } from 'next/font/google'
const wallpoet = Wallpoet({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-logo'
})

const oxanium = Oxanium({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: "Gimme Idea ! - Share your project to get feedback",
  description: "A platform to share your ideas and get creative feedback from others.",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${wallpoet.variable} ${oxanium.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
