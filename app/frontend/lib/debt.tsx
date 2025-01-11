import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Debt } from "@/types/debt"

export const getColumns = (type: "debtor" | "creditor"): ColumnDef<Debt>[] => [
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          القيمة
          <ArrowUpDown className="ms-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return parseFloat(row.original.amount).toFixed(2)
    }
  },
  {
    accessorKey: "currency",
    header: "العملة"
  },
  {
    accessorKey: "description",
    header: "الوصف",
    cell: ({ row }) => {
      return row.original.description || <span className="text-muted-foreground">لا يوجد</span>
    }
  },
  {
    accessorKey: "participant",
    header: type === "debtor" ? "الدائن" : "المدين",
    cell: ({ row }) => {
      const person = row.original[type === "debtor" ? "creditor" : "debtor"]
      return person ? `${person.first_name} ${person.last_name}` : ""
    }
  },
  {
    accessorKey: "settle_date",
    header: "تاريخ الاستحقاق",
    cell: ({ row }) => {
      if (!row.original.settle_date) {
        return <span className="text-muted-foreground">لا يوجد</span>
      }

      return (new Date(row.original.settle_date)).toLocaleDateString()
    }
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => {
      const status = row.original.status
      return status === "pending" ? <Badge variant="destructive">مُعلّق</Badge> : <Badge>مسدد</Badge>
    }
  },
  {
    accessorKey: "created_at",
    header: "تاريخ الإنشاء",
    cell: ({ row }) => {
      return (new Date(row.original.created_at)).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const debt = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="justify-between" onClick={() => console.log(debt.id)}>
              <Trash />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
