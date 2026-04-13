"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Helper to create a server client for actions
async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getDashboardData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Get Profile First (Isolated)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.org_id) {
    return {
      stats: {
        revenue: { amount: 0, change: 0 },
        modules: { active: 0, total: 8 },
        expenses: { amount: 0, change: 0 },
        employees: { active: 0, total: 0 }
      },
      auditLogs: [],
      pendingActions: [],
      upcomingDeadlines: [],
      orgName: "No Organization"
    }
  }

  // 1.5 Get Organization Details (Isolated)
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.org_id)
    .single()

  const orgId = profile.org_id
  const isAuthorized = ['owner', 'admin'].includes(profile.role || 'member')

  // 2. Parallel Data Fetching
  const queries = [
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('organization_modules').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'active'),
    supabase.from('audit_logs').select('*, profiles(full_name)').eq('org_id', orgId).order('created_at', { ascending: false }).limit(5)
  ]

  // Only fetch transactions if authorized
  if (isAuthorized) {
    queries.push(supabase.from('transactions').select('*').eq('org_id', orgId))
  }

  const results = await Promise.all(queries)
  const teamCount = (results[0] as any).count
  const moduleCount = (results[1] as any).count
  const auditLogs = (results[2] as any).data
  const transactions = isAuthorized ? (results[3] as any).data : []

  // 3. Aggregate Financials (This Month)
  const now = new Date()
  const currentMonth = (transactions || []).filter((t: any) => {
    const tDate = new Date(t.created_at)
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
  })

  const revenue = isAuthorized ? currentMonth
    .filter((t: any) => t.type === 'income')
    .reduce((acc: number, t: any) => acc + t.amount, 0) : null

  const expenses = isAuthorized ? currentMonth
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: number, t: any) => acc + t.amount, 0) : null

  // 4. Monthly Aggregates for Chart (Last 6 months)
  const cashFlowData = []
  if (isAuthorized) {
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthName = d.toLocaleString('default', { month: 'short' })
      const month = d.getMonth()
      const year = d.getFullYear()

      const monthTransactions = (transactions || []).filter((t: any) => {
        const tDate = new Date(t.created_at)
        return tDate.getMonth() === month && tDate.getFullYear() === year
      })

      cashFlowData.push({
        month: monthName,
        income: monthTransactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0),
        expense: monthTransactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0)
      })
    }
  }

  return {
    userName: (profile.full_name || "User").split(' ')[0],
    orgName: organization?.name || "My Business",
    userRole: profile.role,
    teamCount: teamCount || 1,
    activeModules: moduleCount || 0,
    revenue,
    expenses,
    recentActivity: auditLogs || [],
    cashFlowData
  }
}
