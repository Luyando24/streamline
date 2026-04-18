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

export async function getProjectSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  const { data: projects } = await supabase
    .from('projects')
    .select('id, budget, status')
    .eq('org_id', profile.org_id)

  const { data: timesheets } = await supabase
    .from('timesheets')
    .select('hours, is_billable')
    .eq('org_id', profile.org_id)

  const activeProjects = projects?.filter(p => p.status === 'active').length || 0
  const totalBillable = timesheets?.filter(t => t.is_billable).reduce((acc, t) => acc + Number(t.hours), 0) || 0
  const totalNonBillable = timesheets?.filter(t => !t.is_billable).reduce((acc, t) => acc + Number(t.hours), 0) || 0
  
  // Calculate aggregate budget utilization
  const totalBudget = projects?.reduce((acc, p) => acc + Number(p.budget), 0) || 0

  return { activeProjects, totalBillable, totalNonBillable, totalBudget }
}

export async function getProjects() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      client:crm_clients(company_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  return projects || []
}

export async function getProjectTasks(projectId?: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  let query = supabase
    .from('project_tasks')
    .select(`
      *,
      assignee:profiles(full_name),
      project:projects(title)
    `)
    .eq('org_id', profile?.org_id)

  if (projectId) query = query.eq('project_id', projectId)

  const { data: tasks } = await query.order('due_date', { ascending: true })
  return tasks || []
}

export async function createProject(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('projects')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/projects')
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('project_tasks')
    .update({ status })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/projects/kanban')
}

export async function logTimeEntry(data: {
  project_id: string,
  task_id?: string,
  hours: number,
  date: string,
  notes: string,
  is_billable: boolean
}) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('id, org_id').eq('user_id', user.id).single()
  if (!profile) throw new Error("Profile not found")

  const { error } = await supabase
    .from('timesheets')
    .insert({ 
      ...data, 
      org_id: profile.org_id, 
      employee_id: profile.id,
      status: 'draft'
    })

  if (error) throw error
  revalidatePath('/projects/timesheets')
}

export async function getTimesheets() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('id, org_id').eq('user_id', user.id).single()
  
  const { data: entries } = await supabase
    .from('timesheets')
    .select(`
      *,
      project:projects(title),
      task:project_tasks(title),
      employee:profiles(full_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('date', { ascending: false })

  return entries || []
}

export async function updateProject(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/projects')
}

export async function updateTask(id: string, data: any) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('project_tasks').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/projects')
}

export async function deleteProjectRecord(id: string, table: 'projects' | 'project_tasks') {
  const supabase = await getSupabase()
  // Non-destructive: update status to 'cancelled'
  const { error } = await supabase.from(table).update({ status: 'cancelled' }).eq('id', id)
  if (error) throw error
  revalidatePath('/projects')
}
