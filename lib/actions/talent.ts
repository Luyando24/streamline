"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getTalentProfile() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile
}

export async function updateTalentProfile(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if locked
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_locked')
    .eq('id', user.id)
    .single()

  if (profile?.profile_locked) {
    throw new Error("Profile is locked for transition integrity. Contact support for identity corrections.")
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nrc_number: data.nrc_number,
      date_of_birth: data.date_of_birth,
      phone: data.phone,
      avatar_url: data.avatar_url,
      role: 'talent' // Ensure role is set
    })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/talent/profile')
}
