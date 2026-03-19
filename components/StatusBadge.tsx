import { Badge } from "@/components/ui/badge"

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge 
      variant={active ? "default" : "secondary"}
      className={active ? "bg-green-500 hover:bg-green-600 text-white" : ""}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  )
}
