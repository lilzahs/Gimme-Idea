import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gimme Idea! - Your Creative Platform",
  description: "Connect, create, and share your ideas with the world",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
