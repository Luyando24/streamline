"use client"

import { useState } from "react"
import { 
  Target, 
  ChevronRight, 
  MoreVertical,
  Briefcase,
  Users,
  BriefcaseIcon,
  Archive,
  Loader2,
  Calendar,
  Search
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { updateProject, deleteProjectRecord } from "@/lib/actions/projects"
import { toast } from "sonner"

export function ProjectMaster({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.client?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        title: formData.get("title"),
        status: formData.get("status"),
        budget: Number(formData.get("budget")),
        description: formData.get("description")
      }
      await updateProject(selectedProject.id, data)
      toast.success("Project architecture updated.")
      setShowEdit(false)
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, ...data } : p))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this project? This will archive it and halt all timesheet allocations.")) return
    setIsSubmitting(true)
    try {
      await deleteProjectRecord(id, 'projects')
      toast.success("Project archived.")
      setProjects(projects.filter(p => p.id !== id))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
        <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
          <Target className="h-5 w-5 text-brand-blue-deep" /> Portfolio Registry
        </h2>
        <div className="flex gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-brand-blue-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Find Engagement..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-[10px] border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue-deep w-48 font-bold transition-all bg-white"
              />
           </div>
        </div>
      </div>

      <div className="p-4">
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((project: any) => (
              <div key={project.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50/80 rounded-full -mr-12 -mt-12 group-hover:bg-brand-blue-pale transition-colors duration-500" />
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-brand-navy group-hover:text-white transition-all">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setSelectedProject(project); setShowEdit(true); }}
                         className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 hover:text-brand-navy transition-all"
                       >
                          <MoreVertical className="h-4 w-4" />
                       </button>
                       <div className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        project.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50/80 text-slate-600 border-slate-200"
                      )}>
                        {project.status}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-brand-navy mb-1 group-hover:text-brand-blue-deep transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 opacity-50" /> {project.client?.company_name || "Internal Portfolio"}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total Budget</div>
                        <div className="text-xs font-black text-brand-navy">K {Number(project.budget).toLocaleString()}</div>
                      </div>
                      <div className="text-[10px] font-black text-slate-400 italic">
                        Start: {new Date(project.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
              <Archive className="h-10 w-10" />
            </div>
            <p className="text-sm font-black text-brand-navy italic opacity-50">Filtered portfolio is empty.</p>
          </div>
        )}
      </div>

      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Project Governance"
        subtitle="Manage Deliverable Specifications"
        icon={<BriefcaseIcon className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Operational Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Project Title / Designation</label>
                   <input name="title" defaultValue={selectedProject?.title} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Financial Allocation (Budget)</label>
                      <input name="budget" type="number" defaultValue={selectedProject?.budget} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Engagement Status</label>
                      <select name="status" defaultValue={selectedProject?.status} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="active">Active High-Velocity</option>
                         <option value="planning">Pre-Execution Planning</option>
                         <option value="completed">Completed / Archive</option>
                         <option value="paused">Paused / Hold</option>
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Scope Specifications</h3>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Brief Description / Mission</label>
                <textarea name="description" rows={3} defaultValue={selectedProject?.description} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
             </div>
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Strategy Update"}
              </button>
              <button 
                type="button"
                onClick={() => handleDelete(selectedProject.id)}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Terminate Active Engagement
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
