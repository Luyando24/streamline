"use server"

import Link from "next/link"
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  ChevronLeft, 
  Globe,
  Archive,
  Target,
  FileText,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react"
import { getJobDetails } from "@/lib/actions/public"
import { notFound } from "next/navigation"
import { IndustrialApplyButton } from "@/components/jobs/ApplyButton"

export default async function VacancyDetailPage({ 
  params 
}: { 
  params: { slug: string, jobId: string } 
}) {
  const job = await getJobDetails(params.jobId)
  
  if (!job) notFound()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-teal selection:text-black font-sans overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12 max-w-[1400px]">
          <Link href={`/jobs/${params.slug}`} className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
               <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Org Vacancies</span>
          </Link>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recruiter Identity</span>
                <span className="text-sm font-bold text-brand-teal">{job.organization.name}</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto pt-20 pb-40 px-6 lg:px-12 relative z-10 grid lg:grid-cols-3 gap-16">
        {/* Left: Job Content */}
        <div className="lg:col-span-2 space-y-16">
           <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal bg-brand-teal/5 w-fit px-4 py-1.5 rounded-full border border-brand-teal/10">
                 <Archive className="h-3 w-3" /> Industrial Requisition
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white italic">{job.title}</h1>
              
              <div className="flex flex-wrap gap-8 pt-6">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Building2 className="h-5 w-5 text-brand-teal" /> {job.department}
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <MapPin className="h-5 w-5 text-brand-teal" /> {job.organization.country} (HQ)
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Briefcase className="h-5 w-5 text-brand-teal" /> Full-Time
                 </div>
              </div>
           </div>

           <div className="space-y-8 p-10 bg-[#141414] border border-white/10 rounded-[48px]">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-teal">
                    <Target className="h-6 w-6" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic">Position <span className="text-brand-teal">Mission</span></h2>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                 {job.description}
              </p>
           </div>

           <div className="space-y-8 p-10 bg-[#141414] border border-white/10 rounded-[48px]">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-teal">
                    <FileText className="h-6 w-6" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic">Core <span className="text-brand-teal">Competencies</span></h2>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                 {job.requirements}
              </p>
           </div>
        </div>

        {/* Right: Sidebar Action */}
        <div className="lg:col-span-1">
           <div className="sticky top-32 space-y-8">
              <div className="p-10 bg-brand-teal/5 border border-brand-teal/10 rounded-[48px] space-y-8 shadow-2xl">
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-white italic tracking-tight">Automated Application</h3>
                    <p className="text-slate-500 text-sm font-bold leading-snug">
                       Your Streamline Profile data (NRC, DOB) will be automatically linked to this requisition upon authorization.
                    </p>
                 </div>

                 <IndustrialApplyButton 
                    jobId={job.id} 
                    orgId={job.org_id} 
                    jobTitle={job.title} 
                 />

                 <div className="grid grid-cols-1 gap-4 pt-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <ShieldCheck className="h-4 w-4 text-brand-teal" /> Guaranteed Integrity
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <Zap className="h-4 w-4 text-brand-teal" /> Instant HR Visibility
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-[#141414] border border-white/10 rounded-[40px] flex items-center gap-6 group hover:border-brand-teal/30 transition-all cursor-pointer">
                 <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-teal group-hover:scale-110 transition-transform">
                    <Layout className="h-6 w-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Share Requisition</h4>
                    <p className="text-[10px] font-bold text-slate-500">Copy internal link</p>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
