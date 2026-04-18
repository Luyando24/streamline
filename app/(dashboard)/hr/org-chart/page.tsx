import { 
  ArrowLeft, 
  ChevronRight, 
  Users, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Sparkles,
  Zap,
  Target,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Layers,
  LayoutDashboard,
  Building2,
  GitBranch,
  ShieldCheck,
  User
} from "lucide-react"
import Link from "next/link"
import { getOrgChart } from "@/lib/actions/hr"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function OrgChartPage() {
  const employees = await getOrgChart()

  // Build the tree
  const buildTree = (managerId: string | null): any[] => {
    return employees
      .filter(e => e.manager_id === managerId)
      .map(e => ({
        ...e,
        children: buildTree(e.profile_id)
      }))
  }

  const rootNodes = buildTree(null)

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 overflow-x-hidden px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/hr" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to HR Hub
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                <GitBranch className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Org Structure</h1>
                <p className="text-slate-700 font-medium tracking-tight">Visualize reporting lines and organizational hierarchy.</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
             <Filter className="h-4 w-4" /> Focus Department
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-blue-deep" /> Update Hierarchy
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-12 bg-white border-2 border-slate-200 rounded-2xl shadow-sm min-h-[600px] overflow-x-auto custom-scrollbar flex flex-col items-center">
        {rootNodes.length > 0 ? (
          <div className="flex flex-col items-center gap-16">
            {rootNodes.map((root) => (
              <OrgTreeNode key={root.id} node={root} />
            ))}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
               <Layers className="h-10 w-10" />
            </div>
            <p className="text-sm font-black text-brand-navy italic uppercase tracking-widest">No hierarchy established.</p>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-fit bg-brand-navy text-white px-10 py-6 rounded-2xl shadow-2xl shadow-brand-navy/20 flex items-center gap-16 backdrop-blur-xl border border-white/10 z-50">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
               <ShieldCheck className="h-5 w-5 text-brand-blue-deep" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Governance Check</div>
               <div className="text-lg font-black tracking-tight text-brand-blue-deep">Verified</div>
            </div>
         </div>
         <div className="h-10 w-px bg-white/10" />
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
               <Layers className="h-5 w-5 text-brand-blue-deep" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Span of Control</div>
               <div className="text-lg font-black tracking-tight">Level 4 Max</div>
            </div>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-brand-blue-deep rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue-deep-light transition-all shadow-lg active:scale-95">
           Export Chart <ChevronRight className="h-3 w-3" />
         </button>
      </div>
    </div>
  )
}

function OrgTreeNode({ node }: { node: any }) {
  return (
    <div className="flex flex-col items-center relative gap-16">
      {/* Node Content */}
      <div className="relative group cursor-pointer">
         <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:border-brand-blue-deep/30 hover:shadow-2xl transition-all duration-500 w-72 relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-slate-50/80 rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex items-center gap-4 mb-4">
               <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm font-black text-brand-navy bg-slate-100">
                  {node.profile?.avatar_url ? (
                    <img src={node.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    node.profile?.full_name?.[0]
                  )}
               </div>
               <div>
                  <div className="text-sm font-black text-brand-navy leading-tight">{node.profile?.full_name}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-0.5">{node.department}</div>
               </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
               <div className="text-[8px] font-black uppercase tracking-widest text-slate-300">Level Node</div>
               <div className="p-1.5 bg-brand-blue-pale rounded-lg">
                  <ChevronRight className="h-3 w-3 text-brand-blue-deep" />
               </div>
            </div>
         </div>
         
         {/* Vertical connector down to children */}
         {node.children.length > 0 && (
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full h-16 w-0.5 bg-slate-100" />
         )}
      </div>

      {/* Children Container */}
      {node.children.length > 0 && (
        <div className="flex items-start gap-12 relative">
          {/* Horizontal crossbar connector */}
          {node.children.length > 1 && (
             <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-[calc(100%-18rem)] bg-slate-100 -translate-y-16" />
          )}

          {node.children.map((child: any) => (
             <div key={child.id} className="relative flex flex-col items-center">
                {/* Short vertical connector from crossbar to child */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-slate-100 -translate-y-16" />
                <OrgTreeNode node={child} />
             </div>
          ))}
        </div>
      )}
    </div>
  )
}

