"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { postJournalEntry } from "./accounting"

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

// VENDORS
export async function getVendors() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('name', { ascending: true })

  return vendors || []
}

export async function createVendor(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  const { error } = await supabase
    .from('vendors')
    .insert({ ...data, org_id: profile.org_id })

  if (error) throw error
  revalidatePath('/procurement/vendors')
}

// REQUISITIONS
export async function submitRequisition(data: {
  title: string,
  vendor_id: string,
  items: { description: string, quantity: number, unit_price: number }[]
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)

  // 1. Create Requisition Header
  const { data: req, error: reqError } = await supabase
    .from('purchase_requisitions')
    .insert({
      org_id: profile.org_id,
      requestor_id: user.id,
      vendor_id: data.vendor_id,
      title: data.title,
      total_amount: totalAmount,
      status: 'pending_l1',
      current_level: 1
    })
    .select()
    .single()

  if (reqError) throw reqError

  // 2. Create Requisition Items
  const items = data.items.map(i => ({
    requisition_id: req.id,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total_price: i.quantity * i.unit_price
  }))

  const { error: itemsError } = await supabase.from('requisition_items').insert(items)
  if (itemsError) throw itemsError

  revalidatePath('/procurement')
  return req
}

export async function getRequisitions(type: 'my' | 'pending' | 'all' = 'my') {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return []

  let query = supabase
    .from('purchase_requisitions')
    .select(`
      *,
      requestor:profiles!purchase_requisitions_requestor_id_fkey (full_name),
      vendor:vendors (name)
    `)
    .eq('org_id', profile.org_id)

  if (type === 'my') query = query.eq('requestor_id', user.id)
  else if (type === 'pending') query = query.in('status', ['pending_l1', 'pending_l2', 'pending_l3'])

  const { data: requisitions } = await query.order('created_at', { ascending: false })
  return requisitions || []
}

export async function approveRequisition(id: string, level: number, comments?: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Add Approval Log
  await supabase.from('requisition_approvals').insert({
    requisition_id: id,
    approver_id: user.id,
    level,
    status: 'approved',
    comments
  })

  // 2. Determine Next Status
  let nextStatus = 'approved'
  let nextLevel = level
  
  if (level === 1) { nextStatus = 'pending_l2'; nextLevel = 2 }
  else if (level === 2) { nextStatus = 'pending_l3'; nextLevel = 3 }

  const { error } = await supabase
    .from('purchase_requisitions')
    .update({ 
      status: nextStatus,
      current_level: nextLevel
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/procurement')
}

export async function disbursePayment(id: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // 1. Fetch Requisition and Items
  const { data: req } = await supabase.from('purchase_requisitions').select('*, vendor:vendors(name)').eq('id', id).single()
  if (!req || req.status !== 'approved') throw new Error("Only approved requisitions can be paid")

  // 2. Post to General Ledger
  // Industrial Standard: Debit Expense (5000), Credit Cash at Bank (1010)
  // We'll need the account IDs
  const { data: accounts } = await supabase.from('accounts').select('id, code').eq('org_id', profile.org_id)
  const getAcc = (code: string) => accounts?.find(a => a.code === code)?.id

  if (!getAcc('5000') || !getAcc('1010')) {
    throw new Error("Standard accounts (5000, 1010) not found. Ensure Finance module is active.")
  }

  await postJournalEntry({
    date: new Date().toISOString().split('T')[0],
    description: `Procurement Payment: ${req.title} (Vendor: ${req.vendor?.name || 'N/A'})`,
    reference_no: `PR-${id.substring(0, 8)}`,
    entries: [
      { account_id: getAcc('5000')!, amount: Number(req.total_amount), entry_type: 'debit' }, // Expense
      { account_id: getAcc('1010')!, amount: Number(req.total_amount), entry_type: 'credit' } // Bank
    ]
  })

  // 3. Mark as Paid
  await supabase.from('purchase_requisitions').update({ status: 'paid' }).eq('id', id)

  revalidatePath('/procurement')
  return { success: true }
}
