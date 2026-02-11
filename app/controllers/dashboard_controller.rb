# frozen_string_literal: true

class DashboardController < InertiaController
  def index
    debts = user_debts
    summaries = build_currency_summaries(debts)
    recent = recent_debts(debts)

    render inertia: "dashboard/Index", props: {
      summaries: summaries,
      recent_debts: recent
    }
  end

  private

  def user_debts
    Debt.where(lender_id: current_user.id)
        .or(Debt.where(borrower_id: current_user.id))
  end

  def build_currency_summaries(debts)
    active_debts = debts.where(status: %w[active settled])
    currencies = active_debts.distinct.pluck(:currency)

    currencies.map do |currency|
      currency_debts = active_debts.where(currency: currency)
      build_summary(currency, currency_debts)
    end
  end

  def build_summary(currency, currency_debts)
    active = currency_debts.where(status: "active")
    settled = currency_debts.where(status: "settled")

    lent_amount = currency_debts.where(lender_id: current_user.id).sum(:amount).to_f
    borrowed_amount = borrowed_total(currency_debts)
    total_paid = total_approved_payments(currency_debts)
    remaining = [ lent_amount + borrowed_amount - total_paid, 0 ].max

    next_installment = next_upcoming_installment(active)

    {
      currency: currency,
      total_lent: lent_amount,
      total_borrowed: borrowed_amount,
      total_paid: total_paid,
      remaining: remaining,
      next_installment_date: next_installment&.due_date&.to_s,
      next_installment_amount: next_installment&.amount&.to_f,
      active_count: active.count,
      settled_count: settled.count
    }
  end

  def borrowed_total(currency_debts)
    # Mutual debts where user is borrower
    mutual_borrowed = currency_debts.where(borrower_id: current_user.id, mode: "mutual").sum(:amount).to_f

    # Personal debts where user is the creator with borrower role
    personal_borrowed = currency_debts.where(lender_id: current_user.id, mode: "personal")
                                      .where(creator_role: "borrower").sum(:amount).to_f

    mutual_borrowed + personal_borrowed
  end

  def total_approved_payments(currency_debts)
    Payment.where(debt_id: currency_debts.select(:id))
           .where(status: "approved")
           .sum(:amount).to_f
  end

  def next_upcoming_installment(active_debts)
    Installment.where(debt_id: active_debts.select(:id))
               .where(status: "upcoming")
               .where("due_date >= ?", Date.current)
               .order(:due_date)
               .first
  end

  def recent_debts(debts)
    debts.where.not(status: "rejected")
         .order(created_at: :desc)
         .limit(5)
         .map { |debt| recent_debt_json(debt) }
  end

  def recent_debt_json(debt)
    {
      id: debt.id,
      counterparty_name: counterparty_name(debt),
      amount: debt.amount.to_f,
      currency: debt.currency,
      status: debt.status,
      mode: debt.mode,
      created_at: debt.created_at.iso8601
    }
  end

  def counterparty_name(debt)
    if debt.personal?
      debt.counterparty_name
    elsif debt.lender_id == current_user.id
      debt.borrower&.full_name || "Unknown"
    else
      debt.lender.full_name
    end
  end
end
