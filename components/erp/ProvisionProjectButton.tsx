"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Loader2,
  Briefcase,
  ShieldCheck,
  Target,
  Users
} from "lucide-react"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { createProject } from "@/lib/actions/projects"
import { getClients } from "@/lib/actions/crm"
import { toast } from "sonner"

export function ProvisionProjectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      getClients().then(setClients)
    }
  }, [isOpen])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        title: formData.get("title"),
        client_id: formData.get("client_id") || null,
        budget: Number(formData.get("budget")),
        description: formData.get("description"),
        status: "active"
      }
      await createProject(data)
      toast.success("New project successfully provisioned.")
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
      >
        <Plus className="h-4 w-4 text-brand-blue-deep" /> Provision Project
      </button>

      <IndustrialModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Service Delivery"
        subtitle="Strategic Project Provisioning"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Engagement Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Project Title / Mission</label>
                   <input name="title" required placeholder="e.g. Infrastructure Modernization Phase I" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Target Client / Account</label>
                   <select name="client_id" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                      <option value="">Internal Project (No Client)</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.company_name}</option>
                      ))}
                   </select>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Financial Allocation</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Project Budget (ZMW)</label>
                   <input name="budget" type="number" required placeholder="0.00" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Strategic Description / Scope</label>
                   <textarea name="description" rows={3} placeholder="Define high-level objectives and deliverables..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Deliverable Launch"}
              </button>
           </div>
        </form>
      </IndustrialModal>
    </>
  )
}
