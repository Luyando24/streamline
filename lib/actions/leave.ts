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

export async function getLeaveStats() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  // Fetch balances for the user
  const { data: balances } = await supabase
    .from('leave_balances')
    .select(`
      *,
      leave_types (*)
    `)
    .eq('employee_id', user.id)
    .eq('year', new Date().getFullYear())

  // Fetch recent requests
  const { data: requests } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (name, color),
      profiles!leave_requests_employee_id_fkey (full_name)
    `)
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return { balances: balances || [], requests: requests || [] }
}

export async function submitLeaveRequest(formData: {
  leave_type_id: string,
  start_date: string,
  end_date: string,
  days_count: number,
  reason: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // 1. Check if they have enough balance
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('remaining_days')
    .eq('employee_id', user.id)
    .eq('leave_type_id', formData.leave_type_id)
    .eq('year', new Date(formData.start_date).getFullYear())
    .single()

  if (!balance || Number(balance.remaining_days) < formData.days_count) {
    throw new Error("Insufficient leave balance for this request.")
  }

  // 2. Submit Request
  const { error } = await supabase
    .from('leave_requests')
    .insert({
      org_id: profile.org_id,
      employee_id: user.id,
      leave_type_id: formData.leave_type_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      days_count: formData.days_count,
      reason: formData.reason,
      status: 'pending'
    })

  if (error) throw error
  revalidatePath('/leave')
  return { success: true }
}

export async function getPendingApprovals() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  const { data: requests } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (name),
      profiles!leave_requests_employee_id_fkey (full_name, email)
    `)
    .eq('org_id', profile.org_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return requests || []
}

export async function processLeaveRequest(requestId: string, status: 'approved' | 'rejected', note?: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Fetch Request
  const { data: request } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) throw new Error("Request not found")

  // 2. If approved, deduct from balance
  if (status === 'approved') {
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('id, remaining_days')
      .eq('employee_id', request.employee_id)
      .eq('leave_type_id', request.leave_type_id)
      .eq('year', new Date(request.start_date).getFullYear())
      .single()

    if (balance) {
      const newBalance = Number(balance.remaining_days) - Number(request.days_count)
      await supabase
        .from('leave_balances')
        .update({ remaining_days: newBalance })
        .eq('id', balance.id)
    }
  }

  // 3. Update Request
  const { error } = await supabase
    .from('leave_requests')
    .update({
      status,
      manager_note: note,
      approved_by: user.id
    })
    .eq('id', requestId)

  if (error) throw error
  revalidatePath('/leave')
  return { success: true }
}

export async function initializeDefaultLeaveTypes(orgId: string) {
  const supabase = await getSupabase()
  
  const defaultTypes = [
    { name: 'Annual Leave', base_days: 24, color: '#22c55e' },
    { name: 'Sick Leave', base_days: 14, color: '#ef4444' },
    { name: 'Compassionate Leave', base_days: 7, color: '#f59e0b' },
    { name: 'Maternity Leave', base_days: 90, color: '#ec4899' },
    { name: 'Paternity Leave', base_days: 5, color: '#3b82f6' }
  ]

  const typesWithOrg = defaultTypes.map(t => ({ ...t, org_id: orgId }))

  const { error } = await supabase
    .from('leave_types')
    .upsert(typesWithOrg, { onConflict: 'org_id,name' })

  if (error) throw error
  return { success: true }
}
