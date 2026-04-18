"use client"

import { useEffect, useState } from "react"
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Check, 
  Loader2,
  Sparkles,
  Fingerprint,
  Verified
} from "lucide-react"
import { toast } from "sonner"
import { getTalentProfile, updateTalentProfile } from "@/lib/actions/talent"
import { cn } from "@/lib/utils"

export default function TalentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await getTalentProfile()
      setProfile(data)
    } catch (err) {
      toast.error("Failed to load profile coordinates.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (profile?.profile_locked) {
       toast.error("Profile is locked for transition integrity.")
       return
    }

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      nrc_number: formData.get("nrc_number"),
      date_of_birth: formData.get("date_of_birth"),
      phone: formData.get("phone"),
      avatar_url: profile?.avatar_url
    }

    try {
      await updateTalentProfile(data)
      toast.success("Identity Coordinates Updated")
      loadProfile()
    } catch (err: any) {
      toast.error(err.message || "Update failure")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest border border-brand-blue/20">
               <Fingerprint className="h-3 w-3" /> Identity Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white italic">Talent <span className="text-brand-blue not-italic">Profile.</span></h1>
            <p className="text-slate-400 font-medium max-w-xl">
               Manage your professional identity coordinates. These fields are used to automatically populate industrial applications.
            </p>
         </div>

         {profile?.profile_locked && (
            <div className="px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center gap-4 text-amber-500 animate-in fade-in slide-in-from-right-4 duration-700">
               <Lock className="h-6 w-6" />
               <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-widest">Profile Locked</span>
                  <p className="text-[10px] font-bold opacity-70">Identity archived during application cycle.</p>
               </div>
            </div>
         )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 p-10 bg-[#141414] border border-white/10 rounded-[48px] shadow-2xl relative overflow-hidden">
        {profile?.profile_locked && <div className="absolute inset-0 bg-black/5 z-10 cursor-not-allowed" />}
        
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Legal Full Name</label>
              <div className="relative">
                 <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                    type="text" 
                    defaultValue={profile?.full_name} 
                    disabled 
                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-slate-400 cursor-not-allowed" 
                 />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                 <Verified className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                    type="text" 
                    defaultValue={profile?.email} 
                    disabled 
                    className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-slate-400 cursor-not-allowed" 
                 />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">NRC Number (Identity ID)</label>
              <div className="relative">
                 <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                    name="nrc_number"
                    type="text" 
                    placeholder="999999/11/1"
                    defaultValue={profile?.nrc_number} 
                    required
                    disabled={profile?.profile_locked}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all disabled:opacity-50" 
                 />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Date of Birth</label>
              <div className="relative">
                 <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                    name="date_of_birth"
                    type="date" 
                    defaultValue={profile?.date_of_birth} 
                    required
                    disabled={profile?.profile_locked}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all disabled:opacity-50 appearance-none" 
                 />
              </div>
           </div>

           <div className="space-y-3 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary Contact Number</label>
              <div className="relative">
                 <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                 <input 
                    name="phone"
                    type="tel" 
                    placeholder="+260 ..."
                    defaultValue={profile?.phone} 
                    required
                    disabled={profile?.profile_locked}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all disabled:opacity-50" 
                 />
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex items-center justify-end">
           {!profile?.profile_locked ? (
              <button 
                type="submit" 
                disabled={isSaving}
                className="group relative px-12 py-5 bg-brand-blue text-black rounded-full text-sm font-black uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98] shadow-2xl flex items-center gap-3"
              >
                 {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Archive Identity Coordinates <Sparkles className="h-5 w-5" /></>}
              </button>
           ) : (
              <div className="flex items-center gap-3 text-emerald-500 font-bold italic text-sm">
                 <Check className="h-5 w-5" /> Profile Synchronized with Recruitment Hub
              </div>
           )}
        </div>
      </form>

      <div className="p-10 bg-brand-blue/5 border border-brand-blue/10 rounded-[48px] flex flex-col md:flex-row items-center gap-10">
         <div className="h-20 w-20 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue flex-shrink-0 animate-pulse">
            <ShieldCheck className="h-10 w-10" />
         </div>
         <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Transition Guard</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
               To prevent identity manipulation in industrial recruitment, your NRC and Date of Birth details become read-only once an application is submitted to any organization on the platform.
            </p>
         </div>
      </div>
    </div>
  )
}
