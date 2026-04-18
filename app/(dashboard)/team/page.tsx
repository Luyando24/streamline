import { getTeamMembers, getCurrentUserRole } from "@/lib/actions/team"
import { TeamManagement } from "@/components/dashboard/team/team-management"

export default async function TeamPage() {
  const members = await getTeamMembers()
  const currentRole = await getCurrentUserRole()

  if (!currentRole) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="space-y-6">
      <TeamManagement 
        initialMembers={members} 
        currentUserRole={currentRole} 
      />
    </div>
  )
}

