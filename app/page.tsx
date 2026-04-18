import Image from "next/image"
import Link from "next/link"
import { 
  ArrowRight,
  BarChart3, 
  Check,
  ChevronRight, 
  Globe, 
  LayoutDashboard,
  Layers, 
  Receipt,
  Search,
  ShieldCheck, 
  Sparkles,
  Users, 
  Wallet,
  Zap,
} from "lucide-react"

import { TestimonialSlider } from "@/components/landing/TestimonialSlider"
import { HeroContent } from "@/components/landing/HeroContent"
import { Reveal } from "@/components/landing/Reveal"
import { createClient } from "@/lib/supabase/server"

const InfinityLoopBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30 select-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1000px] opacity-20 text-brand-teal">
      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-auto origin-center animate-[spin_60s_linear_infinite]"
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M 500,250 C 300,50 100,50 100,250 C 100,450 300,450 500,250 C 700,50 900,50 900,250 C 900,450 700,450 500,250 Z" />
      </svg>
    </div>
    
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1200px] opacity-10 text-brand-teal">
      <svg 
        viewBox="0 0 1000 500" 
        className="w-full h-auto origin-center animate-[spin_90s_linear_infinite_reverse]"
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1"
        style={{ transform: "rotate(45deg)" }}
      >
        <path d="M 500,250 C 300,50 100,50 100,250 C 100,450 300,450 500,250 C 700,50 900,50 900,250 C 900,450 700,450 500,250 Z" />
      </svg>
    </div>

    {/* Ethereal Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-brand-teal opacity-[0.07] blur-[100px] rounded-full animate-pulse" />
  </div>
)

const MODULES_SHOWCASE = [
  { icon: <Wallet className="h-8 w-8" />, name: "Finance & Accounting", desc: "General ledger, budgets, ZRA tax compliance, and automated invoicing." },
  { icon: <Users className="h-8 w-8" />, name: "HR & Payroll", desc: "NAPSA, NHIMA, PAYE — fully automated payslips and leave management." },
  { icon: <Receipt className="h-8 w-8" />, name: "Procurement", desc: "End-to-end requisitions, tiered approvals, and supplier negotiations." },
  { icon: <Layers className="h-8 w-8" />, name: "Inventory Management", desc: "Real-time stock tracking, warehouse configurations, and multi-branch support." },
  { icon: <ShieldCheck className="h-8 w-8" />, name: "Compliance & Audit", desc: "Immutable internal audit trails and automated regulatory checklists." },
  { icon: <BarChart3 className="h-8 w-8" />, name: "BI & Analytics", desc: "Interactive executive dashboards and KPIs for data-driven decisions." },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let hasOrg = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()
    hasOrg = !!profile?.org_id
  }

  const dashboardLink = hasOrg ? "/dashboard" : "/onboarding"
  const getStartedLink = user ? dashboardLink : "/register"

  return (
    <div className="flex min-h-screen flex-col font-sans bg-black text-white selection:bg-brand-teal selection:text-white overflow-x-hidden">
      {/* ========== TOP PROMO BANNER ========== */}
      <Link href={getStartedLink} className="bg-[#e6ffe6] text-black py-2.5 px-4 text-center text-sm font-semibold flex items-center justify-center gap-1 hover:underline cursor-pointer">
        <span>Get started with 30 days free on Streamline Small Business</span>
        <ChevronRight className="h-4 w-4" />
      </Link>

      {/* ========== NAVIGATION ========== */}
      <header className="w-full bg-black">
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          {/* Left Nav */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[28px] font-black tracking-tighter text-brand-teal">Streamline</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/explore" className="text-[15px] font-bold text-white hover:text-slate-300 transition-colors">Products & Solutions</Link>
              <Link href="#accountants" className="text-[15px] font-bold text-white hover:text-slate-300 transition-colors">Accountants</Link>
              <Link href="/jobs" className="text-[15px] font-black text-brand-teal hover:text-white transition-colors flex items-center gap-1 group">
                Jobs <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#support" className="text-[15px] font-bold text-white hover:text-slate-300 transition-colors">Support</Link>
            </nav>
          </div>
          
          {/* Right Nav */}
          <div className="flex items-center gap-6">
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-2 text-[15px] font-bold text-white hover:bg-white hover:text-black transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-full bg-brand-teal px-6 py-2.5 text-sm font-bold text-black shadow hover:bg-brand-teal-light transition-colors"
                >
                  Get started
                </Link>
              </>
            ) : (
              <Link 
                href={dashboardLink}
                className="inline-flex items-center justify-center rounded-full bg-brand-teal px-6 py-2.5 text-sm font-bold text-black shadow hover:bg-brand-teal-light transition-colors"
              >
                {hasOrg ? "Go to Dashboard" : "Complete Setup"}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {/* ========== HERO ========== */}
        <section className="relative px-6 lg:px-12 pt-20 pb-32 overflow-hidden">
          <InfinityLoopBackground />
          
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-10">
            <Reveal direction="down">
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-[76px] leading-[1.05]">
                For every stage of business
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto max-w-2xl text-lg sm:text-[20px] text-slate-300">
                Streamline provides the modular technology and local support to help your African business flow.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="flex flex-col items-center">
              <HeroContent isLoggedIn={!!user} hasOrg={hasOrg} />
            </div>
          </Reveal>
        </section>

        {/* ========== FLOATING UI PREVIEWS ========== */}
        <section className="relative px-6 -mt-20 lg:-mt-10 mb-20">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full opacity-95 hover:opacity-100 transition-opacity">
            
            <Reveal direction="right">
              {/* Left Card: Invoice Progress */}
              <div className="bg-[#f2f2f2] rounded-[32px] p-5 sm:p-8 lg:p-10 shadow-2xl overflow-hidden relative border border-white/10 group hover:shadow-[0_20px_60px_-15px_rgba(0,214,57,0.3)] hover:-translate-y-2 transition-all duration-500">

               {/* Progress steps */}
               <div className="flex items-center justify-between relative mb-12 transform scale-90 sm:scale-100 origin-left">
                  <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-300 -z-10" />
                  
                  <div className="flex flex-col items-center gap-3 bg-[#f2f2f2] pr-2">
                    <div className="h-8 w-8 rounded-full bg-brand-teal text-black flex items-center justify-center shadow-md"><Check className="h-5 w-5" /></div>
                    <span className="text-[14px] font-bold text-black">Created</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 bg-[#f2f2f2] px-2">
                    <div className="h-8 w-8 rounded-full bg-brand-teal text-black flex items-center justify-center shadow-md"><Check className="h-5 w-5" /></div>
                    <span className="text-[14px] font-bold text-black">Sent</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 bg-[#f2f2f2] px-2">
                    <div className="h-8 w-8 rounded-full bg-brand-teal text-black flex items-center justify-center shadow-md"><Check className="h-5 w-5" /></div>
                    <span className="text-[14px] font-bold text-black">Viewed</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 bg-[#f2f2f2] pl-2">
                    <div className="h-8 w-8 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-sm">4</div>
                    <span className="text-[14px] font-bold text-slate-400">Paid</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 sm:gap-6 border-t border-slate-300 pt-8">
                 <div>
                    <div className="text-[10px] sm:text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Amount Paid</div>
                    <div className="text-2xl sm:text-[32px] font-black text-black leading-none">ZMW 14,350</div>
                 </div>
                 <div>
                    <div className="text-[10px] sm:text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Amt Outstanding</div>
                    <div className="text-2xl sm:text-[32px] font-black text-black leading-none">00.00</div>
                 </div>
               </div>
            </div>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              {/* Right Card: Cash Flow */}
              <div className="bg-[#f2f2f2] rounded-[32px] p-8 lg:p-10 shadow-2xl relative border border-white/10 hidden md:block group hover:shadow-[0_20px_60px_-15px_rgba(0,214,57,0.3)] hover:-translate-y-2 transition-all duration-500">
               <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-300">
                  <div className="text-[20px] font-black text-black">Cash Flow Detail</div>
                  <div className="text-[13px] font-bold text-slate-500 bg-white px-4 py-1.5 rounded-full shadow-sm">Lusaka / Ndola</div>
               </div>
               
               <div className="space-y-7">
                 {/* Bar 1 */}
                 <div>
                   <div className="flex justify-between text-[14px] font-bold text-black mb-2">
                     <span>Total Income</span>
                     <span>ZMW 48,200</span>
                   </div>
                   <div className="h-3.5 w-full rounded-full bg-slate-200 overflow-hidden">
                     <div className="h-full rounded-full bg-brand-teal w-[85%]" />
                   </div>
                 </div>
                 
                 {/* Bar 2 */}
                 <div>
                   <div className="flex justify-between text-[14px] font-bold text-black mb-2">
                     <span>Operating Expenses</span>
                     <span>ZMW 22,400</span>
                   </div>
                   <div className="h-3.5 w-full rounded-full bg-slate-200 overflow-hidden">
                     <div className="h-full rounded-full bg-[#ffb020] w-[45%]" />
                   </div>
                 </div>
                 
                 {/* Bar 3 */}
                 <div>
                   <div className="flex justify-between text-[14px] font-bold text-black mb-2">
                     <span>Net Profit</span>
                     <span className="text-brand-teal">ZMW 25,800</span>
                   </div>
                   <div className="h-3.5 w-full rounded-full bg-slate-200 overflow-hidden">
                     <div className="h-full rounded-full bg-slate-800 w-[55%]" />
                   </div>
                 </div>
               </div>
              </div>
            </Reveal>
            
          </div>
        </section>

        {/* ========== MODULES SHOWCASE ========== */}
        <section id="products" className="py-16 md:py-24 relative mt-10">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <Reveal>
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-[56px] font-black tracking-tight text-white mb-4 md:mb-6">
                   Explore our modules
                </h2>
                <p className="text-lg sm:text-[20px] text-slate-300 max-w-2xl mx-auto">
                   Build operations that scale. Subscribe only to the tools you need and snap them together instantly.
                </p>
              </div>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {MODULES_SHOWCASE.map((m, index) => (
                <Reveal key={m.name} delay={index * 0.1}>
                  <div className="flex flex-col rounded-[24px] bg-[#141414] border border-white/10 p-10 hover:-translate-y-3 hover:shadow-[0_10px_40px_-10px_rgba(0,214,57,0.2)] transition-all duration-500 group">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D639]/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-black group-hover:scale-110 transition-all duration-300 shadow-[0_0_0_rgba(0,214,57,0)] group-hover:shadow-[0_0_20px_rgba(0,214,57,0.6)]">
                      {m.icon}
                    </div>
                    <h3 className="mb-3 text-[24px] font-black text-white tracking-tight">{m.name}</h3>
                    <p className="text-[16px] text-slate-400 flex-1 mb-8">{m.desc}</p>
                    <Link href="/explore" className="mt-auto font-bold text-white hover:text-brand-teal flex items-center gap-1">
                      Learn more <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
            
            <div className="text-center mt-12">
               <Link 
                 href="/explore"
                 className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-[15px] font-bold text-black hover:bg-slate-200 transition-colors"
               >
                 View all 20+ modules
               </Link>
            </div>
          </div>
        </section>

        {/* ========== LOGO STRIP / TRUST ========== */}
        <Reveal direction="up" delay={0.2}>
          <section className="py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="text-center text-xs sm:text-[15px] font-bold text-white mb-12 md:mb-16 uppercase tracking-wider">
                OVER 5,000 AFRICAN BUSINESSES TRUST STREAMLINE
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-20 opacity-80 mix-blend-screen">
                 {/* Monochromatic white logos representation */}
                 <div className="text-lg sm:text-[28px] font-black text-white tracking-widest uppercase hover:text-brand-teal transition-colors">Africorp</div>
                 <div className="text-lg sm:text-[28px] font-black text-white tracking-tighter uppercase italic hover:text-brand-teal transition-colors">Zambeef</div>
                 <div className="text-lg sm:text-[28px] font-black text-white tracking-widest lowercase hover:text-brand-teal transition-colors">TRADEKINGS</div>
                 <div className="text-lg sm:text-[28px] font-bold text-white tracking-normal uppercase relative group hover:text-brand-teal transition-colors"><span className="text-2xl sm:text-3xl">P</span>roSec</div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ========== CUSTOMER TEASER ========== */}
        <Reveal delay={0.4}>
          <section className="py-16 md:py-24 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-[56px] font-black tracking-tight text-white mb-4 md:mb-6">Meet our customers</h2>
              <Link 
                href="#"
                className="inline-flex items-center justify-center text-base sm:text-[17px] font-bold text-brand-teal hover:underline mb-8"
              >
                Read Customer Stories <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
              
              <TestimonialSlider />
          </section>
        </Reveal>

      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-black pt-24 pb-12 mt-auto border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-20 text-[15px]">
            <div className="col-span-2 lg:col-span-2 pr-8">
               <Link href="/" className="inline-block mb-8">
                 <span className="text-[28px] font-black tracking-tighter text-brand-teal">Streamline</span>
               </Link>
               <p className="text-slate-400 leading-relaxed mb-6">
                 Streamline provides the modular technology and human support to help your African business flow. Start your self-service ERP journey today.
               </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Products</h4>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Accounting</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Payroll & HR</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Inventory Management</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Point of Sale</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Business Analytics</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Support</h4>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Knowledge Base</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Community Forum</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Training Webinars</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Company</h4>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">About Streamline</Link>
              <Link href="/jobs" className="text-brand-teal font-black hover:text-white transition-colors">Careers & Jobs</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Press</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">Partner Program</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-[13px] font-bold text-slate-400">
               <span>&copy; {new Date().getFullYear()} CodeWave Technologies</span>
               <Link href="#" className="hover:text-white transition-colors">General Terms of Use</Link>
               <Link href="#" className="hover:text-white transition-colors">Privacy Notice</Link>
               <Link href="#" className="hover:text-white transition-colors">Legal Details</Link>
            </div>
            <div className="text-[13px] font-bold text-slate-500">
               Built for all business sizes
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
