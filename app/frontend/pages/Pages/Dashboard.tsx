import Layout from "@/components/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Debt } from "@/types/debt"
import { DebtorView } from "@/components/debtor-view"
import { CreditorView } from "@/components/creditor-view"

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
            <DebtorView debts={debts_as_debtor} />
          </TabsContent>

          <TabsContent value="creditor">
            <CreditorView debts={debts_as_creditor} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
