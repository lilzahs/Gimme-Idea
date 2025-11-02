"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"

async function ensureBucketExists() {
  const supabase = await getSupabaseServiceRole()

  try {
    await supabase.storage.getBucket("gimme-idea")
  } catch (error) {
    // Bucket doesn't exist, create it
    await supabase.storage.createBucket("gimme-idea", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    })
  }
}

export async function uploadImage(file: File, folder: string) {
  await ensureBucketExists()

  const supabase = await getSupabaseServiceRole()

  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${folder}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from("gimme-idea").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("gimme-idea").getPublicUrl(data.path)

  return publicUrl
}

export async function uploadPostImage(file: File) {
  return uploadImage(file, "posts")
}

export async function uploadAvatarImage(file: File) {
  return uploadImage(file, "avatars")
}
