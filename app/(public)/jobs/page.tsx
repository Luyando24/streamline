"use server"

import Link from "next/link"
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  Globe,
  ArrowUpRight
} from "lucide-react"
import { getPublicJobs } from "@/lib/actions/public"

export default async function GlobalJobsPage() {
  const jobs = await getPublicJobs()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-black font-sans overflow-x-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-blue/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12 max-w-[1400px]">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-brand-blue">Streamline</span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">Careers</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-[13px] font-bold text-white hover:bg-white hover:text-black transition-all"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 text-[13px] font-bold text-black shadow-lg shadow-brand-blue/20 hover:bg-white transition-all"
            >
              Sign up as Talent
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto pt-20 pb-40 px-6 lg:px-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-24">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/5 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Sparkles className="h-3 w-3" /> Discover Your Next Transition
           </div>
           <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl mx-auto italic">
              African Corporate <span className="text-brand-blue not-italic">Opportunities.</span>
           </h1>
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Browse vacancies from the continent's most streamlined organizations. One profile, unlimited internal transitions.
           </p>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-[#141414] border border-white/10 rounded-[40px] p-4 sm:p-6 mb-16 flex flex-wrap items-center gap-4 shadow-2xl">
           <div className="flex-1 min-w-[300px] relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search by title, department, or organization..." 
                className="w-full bg-black/40 border border-white/5 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all placeholder:text-slate-600" 
              />
           </div>
           <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest text-slate-300 hover:bg-white hover:text-black transition-all">
              <Filter className="h-4 w-4" /> All Industries
           </button>
           <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-widest text-slate-300 hover:bg-white hover:text-black transition-all">
              <MapPin className="h-4 w-4" /> Zambia
           </button>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {jobs.map((job: any) => (
             <Link 
               key={job.id} 
               href={`/jobs/${job.organization.slug}/${job.id}`}
               className="group p-10 bg-[#141414] border border-white/10 rounded-[48px] hover:border-brand-blue/40 hover:shadow-[0_20px_60px_-15px_rgba(0,214,57,0.2)] transition-all duration-500 flex flex-col justify-between"
             >
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-black transition-all duration-500">
                         <Briefcase className="h-7 w-7" />
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-[9px] font-black uppercase tracking-widest text-brand-blue">
                            Active
                         </div>
                         <div className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest italic opacity-50">
                            Remote Available
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-brand-blue transition-colors mb-2 leading-tight">
                         {job.title}
                      </h3>
                      <div className="flex items-center gap-3 text-brand-blue text-[11px] font-black uppercase tracking-widest">
                         <Building2 className="h-4 w-4" /> {job.organization.name}
                      </div>
                   </div>

                   <p className="text-slate-400 text-sm font-medium line-clamp-3 leading-relaxed">
                      {job.description}
                   </p>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Department</span>
                      <span className="text-sm font-bold text-white">{job.department}</span>
                   </div>
                   <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-brand-blue group-hover:text-black transition-all duration-300">
                      <ArrowUpRight className="h-5 w-5" />
                   </div>
                </div>
             </Link>
           ))}

           {jobs.length === 0 && (
              <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[64px] flex flex-col items-center justify-center text-center space-y-6">
                 <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                    <Briefcase className="h-10 w-10" />
                 </div>
                 <p className="text-lg font-black text-white italic opacity-30">No vacancies currently published.</p>
              </div>
           )}
        </div>
      </main>

      {/* Footer Teaser */}
      <footer className="py-20 border-t border-white/10 bg-[#080808]">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
               Are you a high-performance organization looking to <span className="text-brand-blue">scale?</span>
            </h2>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-brand-blue transition-all active:scale-[0.98] shadow-2xl"
            >
              Initialize Business Ecosystem <ArrowRight className="h-5 w-5" />
            </Link>
         </div>
      </footer>
    </div>
  )
}
