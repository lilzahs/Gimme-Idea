"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { useAppStore } from "@/lib/stores/app-store"

const ACCESS_CODE = "GMI2025"

export default function AccessGate() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const setHasAccess = useAppStore((state) => state.setHasAccess)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === ACCESS_CODE) {
      setHasAccess(true)
      router.push("/connect")
    } else {
      setError("Invalid access code")
      setCode("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to Gimme Idea</h1>
          <p className="text-muted-foreground">Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError("")
              }}
              className="text-center"
            />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </Card>
    </div>
  )
}
