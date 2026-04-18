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

export async function getHrSummary() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return null

  const { data: employees } = await supabase
    .from('hr_employees')
    .select('status, department')
    .eq('org_id', profile.org_id)

  const { data: jobs } = await supabase
    .from('hr_jobs')
    .select('id')
    .eq('org_id', profile.org_id)
    .eq('status', 'open')

  const { data: applicants } = await supabase
    .from('hr_applicants')
    .select('id')
    .eq('org_id', profile.org_id)
    .eq('status', 'applied')

  const totalHeadcount = employees?.length || 0
  const activeCount = employees?.filter(e => e.status === 'active').length || 0
  const openVacancies = jobs?.length || 0
  const totalApplicants = applicants?.length || 0

  return { totalHeadcount, activeCount, openVacancies, totalApplicants }
}

export async function getEmployees() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: employees } = await supabase
    .from('hr_employees')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url),
      manager:profiles!hr_employees_manager_id_fkey(full_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('join_date', { ascending: false })

  return employees || []
}

export async function onboardEmployee(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('hr_employees')
    .upsert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/hr/directory')
}

export async function getOrgChart() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: employees } = await supabase
    .from('hr_employees')
    .select(`
      id,
      profile_id,
      manager_id,
      department,
      profile:profiles(full_name, avatar_url)
    `)
    .eq('org_id', profile?.org_id)

  return employees || []
}

export async function getAppraisals() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: appraisals } = await supabase
    .from('hr_appraisals')
    .select(`
      *,
      employee:hr_employees(profile:profiles(full_name)),
      reviewer:profiles(full_name)
    `)
    .eq('org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  return appraisals || []
}

export async function getRecruitmentStats() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { data: jobs } = await supabase
    .from('hr_jobs')
    .select(`
      *,
      applicants_count:hr_applicants(count)
    `)
    .eq('org_id', profile?.org_id)

  return jobs || []
}

export async function getEmployeeFullDetails(employeeId: string) {
  const supabase = await getSupabase()
  
  const { data: employee } = await supabase
    .from('hr_employees')
    .select(`
      *,
      profile:profiles(full_name, email, avatar_url, phone),
      manager:profiles!hr_employees_manager_id_fkey(full_name),
      documents:hr_documents(*),
      appraisals:hr_appraisals(*, reviewer:profiles(full_name))
    `)
    .eq('id', employeeId)
    .single()

  return employee
}

export async function submitAppraisal(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('id, org_id').eq('user_id', user.id).single()
  
  const { error } = await supabase
    .from('hr_appraisals')
    .insert({ ...data, org_id: profile?.org_id, reviewer_id: profile?.id })

  if (error) throw error
  revalidatePath(`/hr/directory/${data.employee_id}`)
}

export async function uploadHrDocument(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('hr_documents')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath(`/hr/directory/${data.employee_id}`)
}

export async function postJob(data: any) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  
  const { error } = await supabase
    .from('hr_jobs')
    .insert({ ...data, org_id: profile?.org_id })

  if (error) throw error
  revalidatePath('/hr/recruitment')
}

export async function updateApplicantStatus(applicantId: string, status: string, notes?: string) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('hr_applicants')
    .update({ status, notes })
    .eq('id', applicantId)

  if (error) throw error
  revalidatePath('/hr/recruitment')
}
