"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getActiveModules() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get org_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return []

  // Get active modules for this org
  const { data: activeModules, error } = await supabase
    .from('organization_modules')
    .select('module_key')
    .eq('org_id', profile.org_id)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching active modules:', error.message, error.details)
    return []
  }

  return activeModules.map((m: any) => m.module_key)
}

export async function activateModules(slugs: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Get org_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return { error: 'No organization found' }

  // 2. Upsert into organization_modules
  const upsertData = slugs.map(slug => ({
    org_id: profile.org_id,
    module_key: slug,
    status: 'active'
  }))

  const { error: upsertError } = await supabase
    .from('organization_modules')
    .upsert(upsertData, { onConflict: 'org_id,module_key' })

  if (upsertError) {
    console.error('Error activating modules:', upsertError.message, upsertError.details)
    return { error: 'Error activating modules' }
  }

  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}
