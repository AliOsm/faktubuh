import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { DollarSign, Calendar } from 'lucide-react'
import { Debt } from "@/types/debt"
import { getColumns } from "@/lib/debt"

export function CreditorView({ debts }: { debts: Debt[] }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
        <StatCard
          title="عدد الديون"
          value={debts.length.toString()}
          description="عدد الديون التي لك"
          icon={DollarSign}
        />

        {(() => {
          const pendingDebts = debts.filter(debt => debt.status === "pending")
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

      <DataTable columns={getColumns("creditor")} data={debts} />
    </>
  )
}
