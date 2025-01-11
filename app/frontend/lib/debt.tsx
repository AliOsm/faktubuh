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
import CurrencyFlag from "react-currency-flags";

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
      return (
        <div className="ps-4">
          <span className="font-bold">{parseFloat(row.original.amount).toFixed(2)}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "currency",
    header: "العملة",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <CurrencyFlag currency={row.original.currency} size="md" />
        </div>
      )
    }
  },
  {
    accessorKey: "description",
    header: "الوصف",
    cell: ({ row }) => {
      return row.original.description || <span className="text-muted-foreground whitespace-nowrap">لا يوجد</span>
    }
  },
  {
    accessorKey: "participant",
    header: type === "debtor" ? "الدائن" : "المدين",
    cell: ({ row }) => {
      const person = row.original[type === "debtor" ? "creditor" : "debtor"]
      return person ? <span className="whitespace-nowrap">{person.first_name} {person.last_name}</span> : <span className="text-muted-foreground whitespace-nowrap">لا يوجد</span>
    }
  },
  {
    accessorKey: "settle_date",
    header: () => <span className="whitespace-nowrap">تاريخ الاستحقاق</span>,
    cell: ({ row }) => {
      if (!row.original.settle_date) {
        return <span className="text-muted-foreground whitespace-nowrap">لا يوجد</span>
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
    header: () => <span className="whitespace-nowrap">تاريخ الإنشاء</span>,
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
