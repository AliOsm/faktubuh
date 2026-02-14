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

    # Lent = mutual debts where user is lender + personal debts where creator_role is lender
    # (Exclude personal debts where creator_role is borrower - those are counted in borrowed)
    lent_amount = lent_total(currency_debts)
    borrowed_amount = borrowed_total(currency_debts)

    # Calculate lent and borrowed separately
    lent_paid = lent_payments(currency_debts)
    borrowed_paid = borrowed_payments(currency_debts)

    lent_remaining = [lent_amount - lent_paid, 0].max
    borrowed_remaining = [borrowed_amount - borrowed_paid, 0].max

    next_installment = next_upcoming_installment(active)

    {
      currency: currency,
      total_lent: lent_amount,
      total_borrowed: borrowed_amount,
      lent_paid: lent_paid,
      borrowed_paid: borrowed_paid,
      lent_remaining: lent_remaining,
      borrowed_remaining: borrowed_remaining,
      next_installment_date: next_installment&.due_date&.to_s,
      next_installment_amount: next_installment&.amount&.to_f,
      active_count: active.count,
      settled_count: settled.count
    }
  end

  def lent_total(currency_debts)
    # Mutual debts where user is lender
    mutual_lent = currency_debts.where(lender_id: current_user.id, mode: "mutual").sum(:amount).to_f

    # Personal debts where user is the creator with lender role
    personal_lent = currency_debts.where(lender_id: current_user.id, mode: "personal")
                                   .where(creator_role: "lender").sum(:amount).to_f

    mutual_lent + personal_lent
  end

  def borrowed_total(currency_debts)
    # Mutual debts where user is borrower
    mutual_borrowed = currency_debts.where(borrower_id: current_user.id, mode: "mutual").sum(:amount).to_f

    # Personal debts where user is the creator with borrower role
    personal_borrowed = currency_debts.where(lender_id: current_user.id, mode: "personal")
                                      .where(creator_role: "borrower").sum(:amount).to_f

    mutual_borrowed + personal_borrowed
  end

  def lent_payments(currency_debts)
    # Payments for mutual debts where user is lender + personal debts where creator_role is lender
    mutual_lent_ids = currency_debts.where(lender_id: current_user.id, mode: "mutual").pluck(:id)
    personal_lent_ids = currency_debts.where(lender_id: current_user.id, mode: "personal", creator_role: "lender").pluck(:id)
    lent_debt_ids = mutual_lent_ids + personal_lent_ids

    Payment.where(debt_id: lent_debt_ids).where(status: "approved").sum(:amount).to_f
  end

  def borrowed_payments(currency_debts)
    mutual_borrowed_ids = currency_debts.where(borrower_id: current_user.id, mode: "mutual").pluck(:id)
    personal_borrowed_ids = currency_debts.where(lender_id: current_user.id, mode: "personal", creator_role: "borrower").pluck(:id)
    borrowed_debt_ids = mutual_borrowed_ids + personal_borrowed_ids

    Payment.where(debt_id: borrowed_debt_ids).where(status: "approved").sum(:amount).to_f
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
