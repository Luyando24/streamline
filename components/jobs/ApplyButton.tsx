"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Briefcase, 
  Check, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Zap,
  Lock
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ApplyButtonProps {
  jobId: string
  orgId: string
  jobTitle: string
}

export function IndustrialApplyButton({ jobId, orgId, jobTitle }: ApplyButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleApply = async () => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
         toast.error("Authentication required to submit application.")
         router.push(`/login?returnTo=${window.location.pathname}`)
         return
      }

      // 1. Fetch Profile Data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) throw new Error("Failed to fetch talent profile.")

      // 2. Validate Profile Coordinates (NRC/DOB)
      if (!profile.nrc_number || !profile.date_of_birth) {
         toast.error("Incomplete Identity Coordinates. Please finalize your Talent Profile first.", {
            description: "NRC Number and Date of Birth are mandatory for industrial applications.",
            action: {
              label: "Complete Profile",
              onClick: () => router.push('/talent/profile')
            }
         })
         return
      }

      // 3. Submit Application record
      const { error: applyError } = await supabase
        .from('hr_applicants')
        .insert({
           org_id: orgId,
           job_id: jobId,
           profile_id: user.id,
           full_name: profile.full_name,
           email: profile.email,
           phone: profile.phone,
           status: 'applied'
        })

      if (applyError) {
         if (applyError.message.includes('unique constraint')) {
            toast.error("Duplicate Submission Detected", {
               description: "You have already applied for this vacancy."
            })
            return
         }
         throw applyError
      }

      // 4. Lock Profile Integrity (User policy: locked = true)
      await supabase
        .from('profiles')
        .update({ profile_locked: true })
        .eq('id', user.id)

      setIsSuccess(true)
      toast.success("Industrial Application Submitted", {
         description: `Your profile data for '${jobTitle}' is now locked and archived.`
      })
      
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Application failure.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
     return (
        <div className="w-full p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px] flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-500">
           <div className="h-16 w-16 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl">
              <Check className="h-8 w-8" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black text-emerald-500 uppercase tracking-tighter italic">Submission Archived</h4>
              <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-widest">Profile Linked & Integrity Locked</p>
           </div>
        </div>
     )
  }

  return (
    <button
      onClick={handleApply}
      disabled={isSubmitting}
      className={cn(
        "group relative w-full py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl overflow-hidden",
        isSubmitting ? "bg-slate-800 text-slate-400" : "bg-brand-blue text-black hover:bg-white hover:shadow-brand-blue/20"
      )}
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
         {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
         ) : (
            <>
               INITIALIZE APPLICATION <Zap className="h-5 w-5 fill-black" />
            </>
         )}
      </div>
    </button>
  )
}
