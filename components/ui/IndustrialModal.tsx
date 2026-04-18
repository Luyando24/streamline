"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface IndustrialModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  maxWidth?: string
}

export function IndustrialModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon, 
  children,
  maxWidth = "max-w-2xl"
}: IndustrialModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={cn(
        "relative w-full bg-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh] rounded-[40px] overflow-hidden border-2 border-slate-100",
        maxWidth
      )}>
        {/* Header */}
        <div className="flex items-start justify-between p-10 pb-6 border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-1">
            {subtitle && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep">
                {icon} {subtitle}
              </div>
            )}
            <h2 className="text-3xl font-black text-brand-navy tracking-tight">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-all shadow-sm border border-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
