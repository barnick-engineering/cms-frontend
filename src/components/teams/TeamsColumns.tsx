import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "../customers/DataTableColumnHeader"
import type { TeamMember } from "@/interface/teamInterface"
import { Avatar, AvatarFallback } from "../ui/avatar"

export const teamsColumns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "short_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => {
      const shortName = row.getValue<string>("short_name")
      const firstName = row.original.first_name
      const lastName = row.original.last_name
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{shortName}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${firstName} ${lastName}`}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
    cell: ({ row }) => <div>{row.getValue("designation")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
]
