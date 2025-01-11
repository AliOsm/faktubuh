import Layout from "@/components/layout"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Calendar, DollarSign, MoreHorizontal, Trash } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type DebtParticipant = {
  id: number
  first_name: string
  last_name: string
}

export type Debt = {
  id: number
  amount: string
  currency: number
  description: string | null
  creditor?: DebtParticipant
  debtor?: DebtParticipant
  status: "pending" | "settled"
  settle_date: string | null
  created_at: string
}

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

export default function Dashboard({ debts_as_debtor, debts_as_creditor }: { debts_as_debtor: Debt[], debts_as_creditor: Debt[] }) {
  return (
    <Layout>
      <div className="container mx-auto px-2 py-4">
        <Tabs dir="rtl" defaultValue="debtor" className="w-full">
          <TabsList className="max-sm:w-full">
            <TabsTrigger value="debtor" className="max-sm:w-full">عليك</TabsTrigger>
            <TabsTrigger value="creditor" className="max-sm:w-full">لك</TabsTrigger>
          </TabsList>

          <TabsContent value="debtor">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
              <StatCard
                title="عدد الديون"
                value={debts_as_debtor.length.toString()}
                description="عدد الديون التي عليك"
                icon={DollarSign}
              />

              {(() => {
                const pendingDebts = debts_as_debtor.filter(debt => debt.status === "pending")
                const pendingDebtsWithDates = pendingDebts.filter(debt => debt.settle_date)

                if (pendingDebts.length === 0 || pendingDebtsWithDates.length === 0) {
                  return null
                }

                return (
                  <StatCard
                    title="أقرب تاريخ استحقاق"
                    value={pendingDebtsWithDates
                      .reduce((acc, debt) => {
                        const date = new Date(debt.settle_date!)
                        return acc < date ? acc : date
                      }, new Date('10000-01-01')).toLocaleDateString()}
                    description="أقرب تاريخ استحقاق للديون التي عليك"
                    icon={Calendar}
                  />
                )
              })()}
            </div>

            <DataTable columns={getColumns("debtor")} data={debts_as_debtor} />
          </TabsContent>

          <TabsContent value="creditor">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
              <StatCard
                title="عدد الديون"
                value={debts_as_creditor.length.toString()}
                description="عدد الديون التي لك"
                icon={DollarSign}
              />

              {(() => {
                const pendingDebts = debts_as_creditor.filter(debt => debt.status === "pending")
                const pendingDebtsWithDates = pendingDebts.filter(debt => debt.settle_date)

                if (pendingDebts.length === 0 || pendingDebtsWithDates.length === 0) {
                  return null
                }

                return (
                  <StatCard
                    title="أقرب تاريخ استحقاق"
                    value={pendingDebtsWithDates
                      .reduce((acc, debt) => {
                        const date = new Date(debt.settle_date!)
                        return acc < date ? acc : date
                      }, new Date('10000-01-01')).toLocaleDateString()}
                    description="أقرب تاريخ استحقاق للديون التي لك"
                    icon={Calendar}
                  />
                )
              })()}
            </div>

            <DataTable columns={getColumns("creditor")} data={debts_as_creditor} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
