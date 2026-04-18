import { 
  ArrowLeft, 
  ChevronRight, 
  Target, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Users,
  Sparkles,
  Zap,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Layers,
  LayoutDashboard,
  Timer,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { getProjectTasks } from "@/lib/actions/projects"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function GlobalKanbanPage() {
  const tasks = await getProjectTasks()

  const STAGES = [
    { id: 'todo', name: 'Backlog', color: '#94a3b8' },
    { id: 'in_progress', name: 'In Progress', color: '#3b82f6' },
    { id: 'review', name: 'Quality Review', color: '#f59e0b' },
    { id: 'done', name: 'Completed', color: '#22c55e' }
  ]

  const stageGroups = STAGES.map(stage => ({
    ...stage,
    tasks: tasks.filter(t => t.status === stage.id)
  }))

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 overflow-x-hidden px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/projects" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Project Hub
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                <Layers className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Task Board</h1>
                <p className="text-slate-700 font-medium tracking-tight">Visualize work volume and delivery velocity across the organization.</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
             <Filter className="h-4 w-4" /> All Projects
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-green-deep" /> New Deliverable
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[70vh]">
        {stageGroups.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-navy">{stage.name}</h2>
                   <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{stage.tasks.length}</span>
                </div>
                <MoreVertical className="h-4 w-4 text-slate-200" />
             </div>

             <div className={cn(
               "space-y-4 min-h-[500px] border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all duration-500",
               stage.id === 'done' ? "bg-emerald-50/10 border-emerald-100" : "bg-slate-50/80/20"
             )}>
                {stage.tasks.length > 0 ? stage.tasks.map((task) => (
                  <div key={task.id} className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-l-4" style={{ borderLeftColor: task.priority === 'high' || task.priority === 'critical' ? '#ef4444' : '#f8fafc' }}>
                     <div className="flex justify-between items-start mb-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 bg-slate-50/80 px-2 py-0.5 rounded">
                           {task.project?.title || "Global"}
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                          task.priority === 'high' || task.priority === 'critical' ? "bg-red-50 text-red-500" : "bg-slate-50/80 text-slate-600"
                        )}>
                           {task.priority}
                        </div>
                     </div>

                     <h3 className="text-sm font-black text-brand-navy leading-tight mb-2 group-hover:text-brand-green-deep transition-colors line-clamp-2">
                        {task.title}
                     </h3>
                     
                     <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                        <Users className="h-3.5 w-3.5 opacity-50" /> {task.assignee?.full_name || "Unassigned"}
                     </div>

                     <div className="flex items-end justify-between border-t border-slate-200 pt-6">
                        <div>
                           <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Due Date</div>
                           <div className="text-[10px] font-black text-brand-navy">
                             {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Deadline'}
                           </div>
                        </div>
                        <div className="flex -space-x-2">
                           {task.assignee ? (
                              <div className="h-8 w-8 rounded-full bg-brand-navy border-2 border-white flex items-center justify-center text-white text-[9px] font-black shadow-sm">
                                {task.assignee.full_name[0]}
                              </div>
                           ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-300 shadow-sm">
                                <Users className="h-4 w-4" />
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <CheckCircle2 className="h-5 w-5" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest">Stage Cleared</p>
                  </div>
                )}
             </div>
          </div>
        ))}

        {/* Global Add Column Simulation */}
        <div className="flex-shrink-0 w-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/80/10 opacity-40 hover:opacity-100 transition-all cursor-pointer group">
           <Plus className="h-8 w-8 text-slate-300 group-hover:text-brand-green-deep transition-all" />
           <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-600">Custom Stage</span>
        </div>
      </div>
    </div>
  )
}

