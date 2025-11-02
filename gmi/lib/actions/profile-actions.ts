"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"

export async function getOrCreateProfile(walletAddress: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle()

    if (!fetchError && existingProfile) {
      return existingProfile
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert({
        wallet_address: walletAddress,
        name: "",
        bio: "",
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating profile:", createError)
      throw new Error("Failed to create profile")
    }

    return newProfile
  } catch (err) {
    console.error("Error in getOrCreateProfile:", err)
    throw err
  }
}

export async function updateProfile(walletAddress: string, { name, bio }: { name: string; bio: string }) {
  const supabase = await getSupabaseServiceRole()

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      name,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error("Failed to update profile")
  }

  return data
}

export async function getProfile(walletAddress: string) {
  const supabase = await getSupabaseServiceRole()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error)
    throw new Error("Failed to fetch profile")
  }

  return data || null
}
