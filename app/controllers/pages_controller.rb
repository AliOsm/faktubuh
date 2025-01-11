class PagesController < ApplicationController
  def dashboard
    render inertia: "Pages/Dashboard", props: { debts_as_debtor:, debts_as_creditor: }
  end

  def home
    render inertia: "Pages/Home"
  end

  private

  def debts_as_debtor
    serialize_debts(current_user.debts_as_debtor, :creditor)
  end

  def debts_as_creditor
    serialize_debts(current_user.debts_as_creditor, :debtor)
  end

  def serialize_debts(relation, participant)
    relation.includes(participant).map do |debt|
      debt.as_json(
        only: [ :id, :amount, :currency, :description, :status, :settle_date, :created_at ],
        include: { participant => { only: [ :id, :first_name, :last_name ] } }
      )
    end
  end
end
