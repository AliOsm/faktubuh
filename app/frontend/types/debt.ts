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
