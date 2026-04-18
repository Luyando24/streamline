"use server"

import { createClient } from "@/lib/supabase/server"

export async function getPublicJobs() {
  const supabase = await createClient()
  
  const { data: jobs, error } = await supabase
    .from('hr_jobs')
    .select(`
      *,
      organization:organizations(name, slug, industry, country)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw error
  return jobs || []
}

export async function getOrgPortal(slug: string) {
  const supabase = await createClient()
  
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (orgError) return null

  const { data: jobs, error: jobsError } = await supabase
    .from('hr_jobs')
    .select('*')
    .eq('org_id', org.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return { ...org, jobs: jobs || [] }
}

export async function getJobDetails(jobId: string) {
  const supabase = await createClient()
  
  const { data: job, error } = await supabase
    .from('hr_jobs')
    .select(`
      *,
      organization:organizations(name, slug, industry, country)
    `)
    .eq('id', jobId)
    .single()

  if (error) throw error
  return job
}
