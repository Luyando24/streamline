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

export async function getAssetSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  const { data: assets } = await supabase
    .from('fixed_assets')
    .select('purchase_cost, current_value, status')
    .eq('org_id', profile.org_id)

  const totalCost = assets?.reduce((acc, a) => acc + Number(a.purchase_cost), 0) || 0
  const netBookValue = assets?.reduce((acc, a) => acc + Number(a.current_value || a.purchase_cost), 0) || 0
  const maintenanceCount = assets?.filter(a => a.status === 'maintenance').length || 0

  return { totalCost, netBookValue, maintenanceCount, assetCount: assets?.length || 0 }
}

export async function getFixedAssets() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: assets } = await supabase
    .from('fixed_assets')
    .select(`
      *,
      category:asset_categories(name, useful_life_years),
      custodian:profiles(full_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  return assets || []
}

export async function registerAsset(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('fixed_assets')
    .insert({ 
      ...data, 
      org_id: profile?.org_id,
      current_value: data.purchase_cost 
    })

  if (error) throw error
  revalidatePath('/assets')
}

export async function postMonthlyDepreciation(assetId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("Organization not found")

  // 1. Fetch Asset & Category
  const { data: asset } = await supabase
    .from('fixed_assets')
    .select(`
      *,
      category:asset_categories(*)
    `)
    .eq('id', assetId)
    .single()

  if (!asset) throw new Error("Asset not found")

  // 2. Calculate Straight Line Depreciation: (Cost - Salvage) / (Useful Life * 12)
  const cost = Number(asset.purchase_cost)
  const salvage = Number(asset.salvage_value || 0)
  const lifeMonths = Number(asset.category.useful_life_years) * 12
  const monthlyDepr = (cost - salvage) / lifeMonths

  const newCurrentValue = Number(asset.current_value) - monthlyDepr

  // 3. Post to General Ledger
  // Find accounts for Depr Expense (e.g. 5200) and Acc. Depr (e.g. 1890)
  // For this V1, we'll assume standard codes or look them up
  const { data: accDepr } = await supabase.from('accounts').select('id').eq('org_id', profile.org_id).eq('code', '1890').single()
  const { data: deprExp } = await supabase.from('accounts').select('id').eq('org_id', profile.org_id).eq('code', '5200').single()

  if (accDepr && deprExp) {
    await postJournalEntry({
      date: new Date().toISOString().split('T')[0],
      description: `Monthly Depreciation: ${asset.name} (${asset.asset_tag})`,
      entries: [
        { account_id: deprExp.id, amount: monthlyDepr, entry_type: 'debit' },
        { account_id: accDepr.id, amount: monthlyDepr, entry_type: 'credit' }
      ]
    })
  }

  // 4. Update Asset & Log
  await supabase.from('fixed_assets').update({ current_value: newCurrentValue }).eq('id', assetId)
  await supabase.from('asset_depreciation').insert({
    org_id: profile.org_id,
    asset_id: assetId,
    period_date: new Date().toISOString().split('T')[0],
    depreciation_amount: monthlyDepr,
    accumulated_depreciation: cost - newCurrentValue,
    book_value: newCurrentValue
  })

  revalidatePath('/assets')
  return { success: true }
}

export async function logMaintenance(data: {
  asset_id: string,
  service_date: string,
  description: string,
  cost: number,
  next_service_date?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('asset_maintenance')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  
  // Update asset status if cost is high or per user choice
  await supabase.from('fixed_assets').update({ status: 'active' }).eq('id', data.asset_id)

  revalidatePath('/assets')
}

export async function getAssetCategories() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: categories } = await supabase
    .from('asset_categories')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('name', { ascending: true })

  return categories || []
}
