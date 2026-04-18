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

export async function getFleetSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  const { data: vehicles } = await supabase
    .from('fleet_vehicles')
    .select('status, current_mileage')
    .eq('org_id', profile.org_id)

  const { data: fuelLogs } = await supabase
    .from('fleet_fuel_logs')
    .select('cost')
    .eq('org_id', profile.org_id)

  const { data: activeTrips } = await supabase
    .from('fleet_trips')
    .select('id')
    .eq('org_id', profile.org_id)
    .eq('status', 'active')

  const totalFuelSpend = fuelLogs?.reduce((acc, f) => acc + Number(f.cost), 0) || 0
  const totalFleetMileage = vehicles?.reduce((acc, v) => acc + Number(v.current_mileage), 0) || 0
  const activeCount = activeTrips?.length || 0

  return { totalFuelSpend, totalFleetMileage, activeCount, fleetCount: vehicles?.length || 0 }
}

export async function getVehicles() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: vehicles } = await supabase
    .from('fleet_vehicles')
    .select(`
      *,
      asset:fixed_assets(name),
      last_trip:fleet_trips(end_time, driver:profiles(full_name))
    `)
    .eq('org_id', profile?.org_id)
    .order('plate_number', { ascending: true })

  return vehicles || []
}

export async function registerVehicle(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('fleet_vehicles')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/fleet')
}

export async function logFuelFillUp(data: {
  vehicle_id: string,
  liters: number,
  cost: number,
  mileage_at_fill: number,
  fuel_card_no?: string
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('id, org_id').eq('user_id', user.id).single()
  if (!profile) throw new Error("Profile not found")

  // 1. Post to General Ledger (Debit Fuel Expense 5300, Credit Bank 1010)
  // We'll use the postJournalEntry helper from accounting.ts
  const { data: fuelAccount } = await supabase.from('accounts').select('id').eq('org_id', profile.org_id).eq('code', '5300').single()
  const { data: bankAccount } = await supabase.from('accounts').select('id').eq('org_id', profile.org_id).eq('code', '1010').single()

  if (fuelAccount && bankAccount) {
    await postJournalEntry({
      date: new Date().toISOString().split('T')[0],
      description: `Fuel Fill-up: Vehicle #${data.vehicle_id.substring(0, 4)}`,
      entries: [
        { account_id: fuelAccount.id, amount: data.cost, entry_type: 'debit' },
        { account_id: bankAccount.id, amount: data.cost, entry_type: 'credit' }
      ]
    })
  }

  // 2. Record Log
  const { error } = await supabase
    .from('fleet_fuel_logs')
    .insert({ ...data, org_id: profile.org_id, logged_by: profile.id })

  if (error) throw error

  // 3. Update Vehicle mileage if it's higher
  await supabase
    .from('fleet_vehicles')
    .update({ current_mileage: data.mileage_at_fill })
    .eq('id', data.vehicle_id)
    .gt('current_mileage', 0) // Basic sanity check

  revalidatePath('/fleet')
}

export async function startTrip(data: {
  vehicle_id: string,
  purpose: string,
  destination: string,
  start_mileage: number
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('id, org_id').eq('user_id', user.id).single()
  
  const { error } = await supabase
    .from('fleet_trips')
    .insert({ 
      ...data, 
      org_id: profile?.org_id, 
      driver_id: profile?.id,
      status: 'active'
    })

  if (error) throw error

  await supabase
    .from('fleet_vehicles')
    .update({ status: 'active' })
    .eq('id', data.vehicle_id)

  revalidatePath('/fleet')
}

export async function completeTrip(tripId: string, endMileage: number) {
  const supabase = await getSupabase()
  
  const { data: trip } = await supabase.from('fleet_trips').select('vehicle_id').eq('id', tripId).single()
  
  const { error } = await supabase
    .from('fleet_trips')
    .update({ 
      end_mileage: endMileage, 
      end_time: new Date().toISOString(),
      status: 'completed'
    })
    .eq('id', tripId)

  if (error) throw error

  if (trip) {
    await supabase
      .from('fleet_vehicles')
      .update({ 
        status: 'available',
        current_mileage: endMileage
      })
      .eq('id', trip.vehicle_id)
  }

  revalidatePath('/fleet')
}

export async function getTripLogs() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: trips } = await supabase
    .from('fleet_trips')
    .select(`
      *,
      vehicle:fleet_vehicles(plate_number, model),
      driver:profiles(full_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('start_time', { ascending: false })

  return trips || []
}
