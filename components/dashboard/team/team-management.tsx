"use client"

import { useState } from "react"
import { Users, UserPlus, Mail, Lock, User, Shield, X, Trash2 } from "lucide-react"
import { updateMemberRole, quickAddMember, removeMember } from "@/lib/actions/team"
import { toast } from "sonner" // Assuming toast is available or I can mock it

export function TeamManagement({ initialMembers, currentUserRole }: { initialMembers: any[], currentUserRole: string }) {
  const [members, setMembers] = useState(initialMembers)
  const [isAdding, setIsAdding] = useState(false)
  const isAuthorized = ['owner', 'admin'].includes(currentUserRole)

  async function handleRoleChange(memberId: string, newRole: string) {
    if (!isAuthorized) return
    
    try {
      await updateMemberRole(memberId, newRole)
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
      toast.success("Role updated successfully")
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  async function handleRemove(memberId: string) {
    if (currentUserRole !== 'owner') return
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await removeMember(memberId)
      setMembers(members.filter(m => m.id !== memberId))
      toast.success("Member removed")
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy">Team Management</h1>
          <p className="text-slate-500">Manage access and roles for your organization.</p>
        </div>
        {isAuthorized && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-brand-green-deep text-white px-5 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-brand-green-deep/20"
          >
            {isAdding ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isAdding ? "Close" : "Add Member"}
          </button>
        )}
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <div className="rounded-2xl border border-brand-green-pale bg-brand-green-pale/10 p-6 animate-in slide-in-from-top duration-300">
          <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-brand-green-deep" /> Invite New Member
          </h3>
          <form action={async (formData) => {
            try {
              await quickAddMember(formData)
              toast.success("Member added successfully")
              setIsAdding(false)
              // In a real app, we'd refresh the page or use a router push
              window.location.reload()
            } catch (e: any) {
              toast.error(e.message || "Failed to add member")
            }
          }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input name="fullName" required placeholder="John Doe" className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green-deep/20 bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input name="email" type="email" required placeholder="john@example.com" className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green-deep/20 bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Password (Optional)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input name="password" type="password" placeholder="Leave empty to auto-generate" className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green-deep/20 bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Assigned Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select name="role" className="w-full pl-10 pr-4 py-2 text-sm border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green-deep/20 bg-white cursor-pointer">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4 mt-2">
              <button 
                type="submit"
                className="w-full bg-brand-navy text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-all text-sm"
              >
                CREATE ACCOUNT & ADD TO TEAM
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Name & Contact</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Access Level</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Joined</th>
              {currentUserRole === 'owner' && <th className="px-6 py-4 text-right"></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200 uppercase">
                      {member.full_name?.substring(0, 2) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-brand-navy">{member.full_name || "Unknown"}</span>
                      <span className="text-slate-400 text-[11px] font-medium">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isAuthorized && member.role !== 'owner' ? (
                    <select 
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md",
                      member.role === 'owner' ? "bg-brand-green-pale text-brand-green-deep border border-brand-green-deep/10" : "bg-slate-100 text-slate-500"
                    )}>
                      {member.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-[11px] font-bold">
                  {new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </td>
                {currentUserRole === 'owner' && (
                  <td className="px-6 py-4 text-right">
                    {member.role !== 'owner' && (
                      <button 
                        onClick={() => handleRemove(member.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
