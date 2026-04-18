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

export async function getCRMSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  const { data: deals } = await supabase.from('crm_deals').select('value, stage').eq('org_id', profile.org_id)
  const { count: leadCount } = await supabase.from('crm_leads').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id)
  const { count: clientCount } = await supabase.from('crm_clients').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id)

  const pipelineValue = deals?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((acc, curr) => acc + Number(curr.value), 0) || 0
  
  const weightedValue = deals?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((acc, curr) => acc + (Number(curr.value) * 0.5), 0) || 0 // Simple 50% weight for now

  return { leadCount, clientCount, pipelineValue, weightedValue }
}

export async function getLeads() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: leads } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  return leads || []
}

export async function getClients() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: clients } = await supabase
    .from('crm_clients')
    .select(`
      *,
      deals:crm_deals (value, stage)
    `)
    .eq('org_id', profile?.org_id)
    .order('company_name', { ascending: true })

  return clients || []
}

export async function getDeals() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: deals } = await supabase
    .from('crm_deals')
    .select(`
      *,
      client:crm_clients (company_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('expected_close_date', { ascending: true })

  return deals || []
}

export async function createLead(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('crm_leads')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/crm')
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Fetch Lead
  const { data: lead } = await supabase.from('crm_leads').select('*').eq('id', leadId).single()
  if (!lead) throw new Error("Lead not found")

  // 2. Create Client
  const { data: client, error: clientError } = await supabase
    .from('crm_clients')
    .insert({
      org_id: lead.org_id,
      company_name: lead.company || lead.name,
      contact_person: lead.name,
      email: lead.email,
      phone: lead.phone
    })
    .select()
    .single()

  if (clientError) throw clientError

  // 3. Mark Lead as Converted
  await supabase.from('crm_leads').update({ status: 'converted' }).eq('id', leadId)

  revalidatePath('/crm')
  return client
}

export async function createClient(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('crm_clients')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/crm/clients')
}

export async function logInteraction(data: {
  client_id?: string,
  lead_id?: string,
  type: 'call' | 'email' | 'meeting' | 'note',
  notes: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('crm_interactions')
    .insert({
      ...data,
      org_id: profile?.org_id,
      performed_by: user.id
    })

  if (error) throw error
}

export async function updateDealStage(id: string, stage: string) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('crm_deals')
    .update({ stage })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/crm')
}

export async function updateLead(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('crm_leads').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/crm')
}

export async function updateClient(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('crm_clients').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/crm/clients')
}

export async function updateDeal(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('crm_deals').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/crm')
}

export async function deleteCrmRecord(id: string, table: 'crm_leads' | 'crm_clients' | 'crm_deals') {
  const supabase = await getSupabase()
  // Non-destructive: update is_active or status
  let updateData: any = { is_active: false }
  
  if (table === 'crm_leads') updateData = { status: 'rejected' }
  if (table === 'crm_deals') updateData = { stage: 'closed_lost' }

  const { error } = await supabase.from(table).update(updateData).eq('id', id)
  if (error) throw error
  revalidatePath('/crm')
}
