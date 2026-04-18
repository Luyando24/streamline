"use server"

import Link from "next/link"
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  ChevronLeft, 
  Globe,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from "lucide-react"
import { getOrgPortal } from "@/lib/actions/public"
import { notFound } from "next/navigation"

export default async function OrgPortalPage({ params }: { params: { slug: string } }) {
  const org = await getOrgPortal(params.slug)
  
  if (!org) notFound()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-black font-sans overflow-x-hidden">
      {/* Navigation */}
      <header className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12 max-w-[1400px]">
          <Link href="/jobs" className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
               <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Back to Jobs Feed</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center rounded-full bg-brand-blue px-8 py-3 text-[13px] font-bold text-black shadow-lg shadow-brand-blue/20 hover:bg-white transition-all underline decoration-2 underline-offset-4"
            >
              Initialize My Organization
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto pt-20 pb-40 px-6 lg:px-12 relative z-10">
        {/* Org Banner */}
        <div className="relative p-12 md:p-20 bg-[#141414] border border-white/10 rounded-[64px] mb-20 overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 h-80 w-80 bg-brand-blue/5 -mr-20 -mt-20 rounded-full blur-[100px] transition-all duration-700 group-hover:bg-brand-blue/10" />
           
           <div className="relative z-10 space-y-8 max-w-3xl">
              <div className="flex items-center gap-4">
                 <div className="h-20 w-20 rounded-3xl bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-brand-blue">
                    {org.name[0]}
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">
                       <ShieldCheck className="h-3 w-3" /> Verified Enterprise
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{org.name}</h1>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Industry</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                       <TrendingUp className="h-3.5 w-3.5 text-brand-blue" /> {org.industry}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">HQ Location</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                       <Globe className="h-3.5 w-3.5 text-brand-blue" /> {org.country}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ecytem Tier</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                       <Zap className="h-3.5 w-3.5 text-brand-blue" /> {org.tier} Scale
                    </div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Vacancies</div>
                    <div className="text-sm font-bold text-white">{org.jobs.length} Positions</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Org Job List */}
        <div className="space-y-10">
           <h2 className="text-2xl font-black text-white italic pl-4">Current <span className="text-brand-blue">Opportunities</span></h2>
           
           <div className="grid md:grid-cols-2 gap-8">
              {org.jobs.map((job: any) => (
                <Link 
                  key={job.id} 
                  href={`/jobs/${org.slug}/${job.id}`}
                  className="group p-10 bg-[#141414] border border-white/10 rounded-[48px] hover:border-brand-blue/40 transition-all duration-500 flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(0,214,57,0.1)]"
                >
                   <div className="space-y-8">
                      <div className="flex justify-between items-start">
                         <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-black transition-all">
                            <Briefcase className="h-6 w-6" />
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-brand-blue transition-colors">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                         </div>
                      </div>

                      <div>
                         <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-brand-blue transition-colors">
                            {job.title}
                         </h3>
                         <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            {job.department}
                         </div>
                      </div>

                      <p className="text-slate-400 text-sm font-medium line-clamp-2">
                         {job.description}
                      </p>
                   </div>

                   <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Automated Application</span>
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-blue group-hover:text-black transition-all">
                         <ArrowUpRight className="h-5 w-5" />
                      </div>
                   </div>
                </Link>
              ))}

              {org.jobs.length === 0 && (
                 <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[48px] text-center">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">No open vacancies at this time.</p>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  )
}
