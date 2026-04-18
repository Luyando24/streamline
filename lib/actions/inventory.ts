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

// 1. STATS & ANALYTICS
export async function getInventoryStats() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  // Fetch all stock levels
  const { data: stock } = await supabase
    .from('stock_levels')
    .select('quantity, avg_cost')
    .eq('org_id', profile.org_id)

  const { data: items } = await supabase
    .from('inventory_items')
    .select('id, reorder_level')
    .eq('org_id', profile.org_id)

  const totalValue = stock?.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.avg_cost)), 0) || 0
  const totalItems = items?.length || 0
  
  // Find low stock items
  const lowStockCount = items?.filter(item => {
    const itemStock = stock?.filter(s => s as any === (item as any).id).reduce((acc, s) => acc + Number(s.quantity), 0) || 0
    return itemStock <= Number(item.reorder_level)
  }).length || 0

  return { totalValue, totalItems, lowStockCount }
}

// 2. MASTER REGISTRY
export async function getInventoryItems() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: items } = await supabase
    .from('inventory_items')
    .select(`
      *,
      stock_levels (quantity, avg_cost, warehouses(name))
    `)
    .eq('org_id', profile?.org_id)
    .order('name', { ascending: true })

  return items || []
}

export async function createInventoryItem(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('inventory_items')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/inventory')
}

// 3. MOVEMENTS & WAREHOUSES
export async function getWarehouses() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('name', { ascending: true })

  return warehouses || []
}

export async function recordStockMovement(data: {
  item_id: string,
  warehouse_id: string,
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT',
  quantity: number,
  unit_price?: number,
  reason?: string,
  reference_no?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) throw new Error("No organization found")

  // 1. Record Transaction
  const { error: txError } = await supabase
    .from('inventory_transactions')
    .insert({
      org_id: profile.org_id,
      item_id: data.item_id,
      warehouse_id: data.warehouse_id,
      type: data.type,
      quantity: data.quantity,
      unit_price: data.unit_price,
      reason: data.reason,
      reference_no: data.reference_no,
      performed_by: user.id
    })

  if (txError) throw txError

  // 2. Update Stock Level (Atomic via UPSERT)
  const { data: currentStock } = await supabase
    .from('stock_levels')
    .select('*')
    .eq('item_id', data.item_id)
    .eq('warehouse_id', data.warehouse_id)
    .single()

  let newQty = Number(currentStock?.quantity || 0)
  let newAvgCost = Number(currentStock?.avg_cost || 0)

  if (['IN', 'ADJUSTMENT', 'TRANSFER_IN'].includes(data.type)) {
    // If IN, recalculate Weighted Average Cost
    if (data.unit_price) {
      const currentTotalValue = newQty * newAvgCost
      const incomingTotalValue = data.quantity * data.unit_price
      newQty += Number(data.quantity)
      newAvgCost = (currentTotalValue + incomingTotalValue) / newQty
    } else {
      newQty += Number(data.quantity)
    }
  } else {
    newQty -= Number(data.quantity)
  }

  const { error: stockError } = await supabase
    .from('stock_levels')
    .upsert({
      org_id: profile.org_id,
      item_id: data.item_id,
      warehouse_id: data.warehouse_id,
      quantity: newQty,
      avg_cost: newAvgCost,
      last_updated: new Date().toISOString()
    })

  if (stockError) throw stockError

  revalidatePath('/inventory')
  return { success: true }
}

export async function createWarehouse(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('warehouses')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/inventory/warehouses')
}
