import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

let supabaseServer: ReturnType<typeof createServerClient> | null = null
let supabaseServiceRole: ReturnType<typeof createServerClient> | null = null

export async function getSupabaseServer() {
  if (supabaseServer) return supabaseServer

  const cookieStore = await cookies()

  supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as CookieOptions))
          } catch {
            // Error handling for older Node versions
          }
        },
      },
    },
  )

  return supabaseServer
}

export async function getSupabaseServiceRole() {
  if (supabaseServiceRole) return supabaseServiceRole

  supabaseServiceRole = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    },
  )

  return supabaseServiceRole
}
