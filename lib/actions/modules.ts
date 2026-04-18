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
    .from('org_modules')
    .select('modules(slug)')
    .eq('org_id', profile.org_id)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching active modules:', error)
    return []
  }

  return activeModules.map((m: any) => m.modules.slug)
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

  // 2. Get module IDs for these slugs
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, slug')
    .in('slug', slugs)

  if (modulesError || !modules) {
    console.error('Error fetching module IDs:', modulesError)
    return { error: 'Error fetching module details' }
  }

  // 3. Insert into org_modules
  const upsertData = modules.map(m => ({
    org_id: profile.org_id,
    module_id: m.id,
    is_active: true
  }))

  const { error: upsertError } = await supabase
    .from('org_modules')
    .upsert(upsertData, { onConflict: 'org_id,module_id' })

  if (upsertError) {
    console.error('Error activating modules:', upsertError)
    return { error: 'Error activating modules' }
  }

  revalidatePath('/(dashboard)', 'layout')
  return { success: true }
}
