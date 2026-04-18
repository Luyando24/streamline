import { 
  Receipt, 
  UserCheck, 
  CalendarClock, 
  LineChart, 
  FileSearch, 
  Package, 
  Truck, 
  Briefcase, 
  Target, 
  Users2, 
  Layers, 
  FileText, 
  ClipboardList, 
  GraduationCap, 
  Clock, 
  FileSpreadsheet, 
  BarChart4, 
  BrainCircuit, 
  Zap, 
  Network,
  LayoutDashboard,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Reveal } from "@/components/landing/Reveal"

const MODULES_EXPLORER_DATA = [
  { id: "finance-accounting", name: "Finance & Accounting", category: "Core", price: "ZMW 1,200", desc: "General ledger, budgeting, ZRA compliance, and automated invoicing.", icon: Receipt, route: "/accounting" },
  { id: "payroll-management", name: "Payroll Management", category: "Core", price: "ZMW 800", desc: "Local tax compliance (PAYE, NAPSA, NHIMA) and automated payslips.", icon: UserCheck, route: "/payroll" },
  { id: "leave-management", name: "Leave Management", category: "Core", price: "ZMW 400", desc: "Digital leave applications, multi-level approvals, and automated balances.", icon: CalendarClock, route: "/leave" },
  { id: "performance-management", name: "Performance Management", category: "Core", price: "ZMW 600", desc: "KPI tracking, employee appraisals, and 360-degree feedback loops.", icon: LineChart, route: "/hr/appraisals" },
  { id: "procurement-management", name: "Procurement Management", category: "Core", price: "ZMW 700", desc: "Purchase requisitions, supplier database, and tiered approval workflows.", icon: FileSearch, route: "/procurement" },
  { id: "inventory-management", name: "Inventory Management", category: "Core", price: "ZMW 700", desc: "Real-time stock tracking, low-stock alerts, and multi-warehouse support.", icon: Package, route: "/inventory" },
  { id: "fleet-management", name: "Fleet Management", category: "Core", price: "ZMW 600", desc: "Vehicle maintenance tracking, fuel monitoring, and trip logging.", icon: Truck, route: "/fleet" },
  { id: "hris-suite", name: "HRIS Full Suite", category: "Add-On", price: "ZMW 1,000", desc: "Centralized employee records, digital onboarding, and contract management.", icon: Briefcase, route: "/hr" },
  { id: "project-management", name: "Project Management", category: "Add-On", price: "ZMW 800", desc: "Project timelines, task kanban boards, and donor/grant reporting.", icon: Target, route: "/projects" },
  { id: "crm", name: "CRM", category: "Add-On", price: "ZMW 900", desc: "Lead management, sales pipeline tracking, and customer history.", icon: Users2, route: "/crm" },
  { id: "asset-management", name: "Asset Management", category: "Add-On", price: "ZMW 500", desc: "Fixed asset registry, depreciation scheduling, and maintenance logs.", icon: Layers, route: "/assets" },
  { id: "document-management", name: "Document Management", category: "Add-On", price: "ZMW 600", desc: "Secure cloud document storage with version control and permissions.", icon: FileText, route: "/dashboard" },
  { id: "compliance-audit", name: "Compliance & Audit", category: "Add-On", price: "ZMW 700", desc: "Immutable internal audit trails and automated regulatory compliance.", icon: ClipboardList, route: "/dashboard" },
  { id: "training-elearning", name: "E-learning & Training", category: "Add-On", price: "ZMW 500", desc: "In-house training modules, assessments, and staff certifications.", icon: GraduationCap, route: "/hr" },
  { id: "time-attendance", name: "Time & Attendance", category: "Add-On", price: "ZMW 500", desc: "Biometric and geo-fenced clock-in systems for field and office staff.", icon: Clock, route: "/hr" },
  { id: "expense-management", name: "Expense Management", category: "Add-On", price: "ZMW 500", desc: "Staff expense claims, receipt uploads, and rapid reimbursements.", icon: FileSpreadsheet, route: "/accounting" },
  { id: "bi-analytics", name: "BI & Analytics", category: "Add-On", price: "ZMW 1,000", desc: "Advanced executive dashboards with real-time business insights.", icon: BarChart4, route: "/dashboard" },
  { id: "ai-insights", name: "AI Insights", category: "Premium", price: "ZMW 1,500", desc: "Predictive financial modeling and AI-driven growth recommendations.", icon: BrainCircuit, route: "/dashboard" },
  { id: "api-hub", name: "API Integration Hub", category: "Premium", price: "ZMW 1,200", desc: "Connect Streamline with your banking, ERP, or legacy systems.", icon: Zap, route: "/dashboard" },
  { id: "multi-entity", name: "Multi-Entity Management", category: "Premium", price: "ZMW 1,500", desc: "Manage multiple branches or subsidiary companies from one console.", icon: Network, route: "/dashboard" },
]

export default async function ExploreModulesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue pb-20 overflow-x-hidden">
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[400px] bg-brand-blue opacity-[0.05] blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <Reveal direction="down">
             <Link href="/" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors mb-4">
               <ChevronRight className="h-3 w-3 rotate-180" /> Back to Home
             </Link>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-black tracking-tight leading-[1.05]">
              Explore the <span className="text-brand-blue">Ecosystem</span>
            </h1>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-lg sm:text-[20px] text-slate-300 max-w-2xl mx-auto">
              Whether you're managing 5 employees or 5,000, Streamline scales with you. 
              Discover the modular tools built specifically for the African business landscape.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========== SEARCH & FILTER BAR ========== */}
      <section className="px-6 lg:px-12 mb-16 relative z-10">
        <div className="max-w-[1200px] mx-auto bg-[#141414] border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search for a specific module or capability..." 
                className="w-full bg-transparent pl-12 pr-6 py-3 text-sm font-medium border-none focus:ring-0 focus:outline-none placeholder:text-slate-600"
              />
           </div>
           <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 w-full md:w-fit overflow-x-auto whitespace-nowrap scrollbar-hide">
              {["All Modules", "Finance", "HR", "Operations", "Premium"].map((tab, i) => (
                <button key={tab} className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${i === 0 ? "bg-brand-blue text-black" : "text-slate-400 hover:text-white"}`}>
                  {tab}
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* ========== MODULE GRID ========== */}
      <section className="px-6 lg:px-12 relative z-10">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MODULES_EXPLORER_DATA.map((module, index) => {
            const Icon = module.icon
            const loginUrl = user ? module.route : `/login?redirectTo=${module.route}`
            const buttonText = user ? `Enter ${module.name}` : `Login to ${module.name}`

            return (
              <Reveal key={module.id} delay={index * 0.05} direction="up">
                <div className="group relative flex flex-col h-full bg-[#141414] border border-white/10 rounded-3xl p-8 hover:border-brand-blue/40 hover:shadow-[0_20px_60px_-15px_rgba(0,214,57,0.15)] transition-all duration-500 overflow-hidden">
                  
                  {/* Category & Price Badge */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-black transition-all duration-500 shadow-sm group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue border border-brand-blue/20 px-2.5 py-1 rounded-full">
                         {module.category}
                       </span>
                       <span className="text-sm font-black text-slate-300">
                         {module.price} <span className="text-[10px] text-slate-600">/mo</span>
                       </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-brand-blue transition-colors">
                    {module.name}
                  </h3>
                  
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-1">
                    {module.desc}
                  </p>

                  <div className="mt-auto space-y-4">
                     <Link 
                       href={loginUrl}
                       className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all active:scale-[0.98] shadow-lg shadow-white/5 group/btn"
                     >
                       <span className="relative z-10">{buttonText}</span>
                       <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                     </Link>
                     
                     {!user && (
                       <Link 
                         href="/register" 
                         className="w-full flex items-center justify-center gap-2 py-3 text-brand-blue text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors"
                       >
                         Start 30-Day Free Trial <ChevronRight className="h-3 w-3" />
                       </Link>
                     )}
                  </div>

                  {/* Aesthetic Corner Polish */}
                  <div className="absolute top-0 right-0 h-24 w-24 bg-brand-blue opacity-0 group-hover:opacity-[0.03] blur-[40px] rounded-full transition-opacity duration-700 pointer-events-none" />
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ========== CTA FOOTER FOOTER ========== */}
      <section className="mt-32 px-6 lg:px-12">
         <Reveal direction="up">
            <div className="max-w-[1240px] mx-auto bg-brand-blue rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 group-hover:opacity-[0.15] transition-opacity duration-700" />
               <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/20 blur-[120px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
               
               <div className="relative z-10 space-y-8">
                  <h2 className="text-3xl sm:text-5xl lg:text-[64px] font-black tracking-tight text-black leading-tight">
                    Ready to streamline <br className="hidden md:block" /> your operations?
                  </h2>
                  <p className="text-black/70 font-bold text-lg max-w-2xl mx-auto">
                    Take the first step towards a more efficient, data-driven business. No credit card required to get started.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                     <Link href="/register" className="px-10 py-5 bg-black text-white rounded-full text-base font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95">
                        Start for Free
                     </Link>
                     <Link href="/" className="px-10 py-5 bg-transparent border-2 border-black text-black rounded-full text-base font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Talk to an Expert
                     </Link>
                  </div>
               </div>
            </div>
         </Reveal>
      </section>
      
      {/* Footer minimal */}
      <div className="mt-20 text-center text-[11px] font-black text-slate-600 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} CodeWave Technologies &bull; Built in Lusaka, Zambia
      </div>
    </div>
  )
}
