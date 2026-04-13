"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Standard client for user-specific actions (respects RLS)
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

// Admin client for bypass operations (e.g. creating users)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function getTeamMembers() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: true })

  return members || []
}

export async function getCurrentUserRole() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role || 'member'
}

export async function updateMemberRole(targetId: string, newRole: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: currentUser } = await supabase.from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!currentUser || !['owner', 'admin'].includes(currentUser.role)) {
    throw new Error("Permission denied")
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetId)
    .eq('org_id', currentUser.org_id)

  if (error) throw error
  return { success: true }
}

export async function quickAddMember(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const rawPassword = formData.get('password') as string
  const role = formData.get('role') as string
  
  // Auto-generate a secure password if not provided
  const password = rawPassword || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))

  const supabase = await getSupabase()
  const adminSupabase = getAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: currentUser } = await supabase.from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!currentUser || !['owner', 'admin'].includes(currentUser.role)) {
    throw new Error("Permission denied")
  }

  // 1. Create User in Auth
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName },
    email_confirm: true
  })

  // Handle case where user already exists in Auth but not in this Org
  if (authError) {
    if (authError.message.includes('already registered')) {
      // Find existing user
      const { data: existingUser } = await adminSupabase.from('profiles').select('id, org_id').eq('email', email).single()
      if (existingUser) {
        if (existingUser.org_id === currentUser.org_id) throw new Error("User already in team")
        
        // Link existing user to this org
        const { error: linkError } = await adminSupabase
          .from('profiles')
          .update({ org_id: currentUser.org_id, role: role })
          .eq('id', existingUser.id)
        
        if (linkError) throw linkError
        return { success: true, joined: true }
      }
    }
    throw authError
  }

  // 2. Update Profile
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ 
      org_id: currentUser.org_id,
      role: role,
      full_name: fullName,
      email: email
    })
    .eq('id', authUser.user.id)

  if (profileError) throw profileError

  return { success: true }
}

export async function removeMember(targetId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: currentUser } = await supabase.from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!currentUser || !['owner', 'admin'].includes(currentUser.role)) {
    throw new Error("Permission denied")
  }
  
  // Decouple from Org
  const { error } = await supabase
    .from('profiles')
    .update({ org_id: null })
    .eq('id', targetId)
    .eq('org_id', currentUser.org_id)

  if (error) throw error
  return { success: true }
}
